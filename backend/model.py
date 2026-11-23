"""
ParkiSight-AI flagship model architecture: NeuroCrossVelocityNet
Combines TabResNet clinical encoding, Lightweight 3D CNN for neuroimaging (DaTSCAN SPECT),
Spatial Self-Attention, Causal Cross-Modal Attention, and Adaptive Modality Gating (AMGU).
"""

import torch
import torch.nn as nn


class Lightweight3DCNN(nn.Module):
    """
    Lightweight 3D CNN extracting spatial feature tokens from NIfTI volumes (128x128x120).
    Produces 448 spatial tokens (8x8x7) of dimension hidden_dim.
    """
    def __init__(self, in_channels: int = 1, hidden_dim: int = 256):
        super().__init__()
        self.block1 = nn.Sequential(
            nn.Conv3d(in_channels, 32, kernel_size=3, padding=1),
            nn.BatchNorm3d(32),
            nn.GELU(),
            nn.MaxPool3d(2)  # 64x64x60
        )
        self.block2 = nn.Sequential(
            nn.Conv3d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm3d(64),
            nn.GELU(),
            nn.MaxPool3d(2)  # 32x32x30
        )
        self.block3 = nn.Sequential(
            nn.Conv3d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm3d(128),
            nn.GELU(),
            nn.MaxPool3d(2)  # 16x16x15
        )
        self.block4 = nn.Sequential(
            nn.Conv3d(128, hidden_dim, kernel_size=3, padding=1),
            nn.BatchNorm3d(hidden_dim),
            nn.GELU(),
            nn.MaxPool3d(2)  # 8x8x7 = 448 tokens
        )
        self.hidden_dim = hidden_dim

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        b, c, h, w, d = x.shape
        x = x.view(b, c, -1)
        return x.transpose(1, 2)  # (B, 448, hidden_dim)


class TabularResNetBlock(nn.Module):
    """
    Gated Residual Block for clinical tabular features.
    """
    def __init__(self, hidden_dim: int, dropout: float = 0.2):
        super().__init__()
        self.norm = nn.LayerNorm(hidden_dim)
        self.linear_val = nn.Linear(hidden_dim, hidden_dim * 2)
        self.linear_gate = nn.Linear(hidden_dim, hidden_dim * 2)
        self.act = nn.GELU()
        self.dropout1 = nn.Dropout(dropout)
        self.linear_out = nn.Linear(hidden_dim * 2, hidden_dim)
        self.dropout2 = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = x
        normed = self.norm(x)
        val = self.act(self.linear_val(normed))
        gate = torch.sigmoid(self.linear_gate(normed))
        gated = self.dropout1(val * gate)
        out = self.linear_out(gated)
        out = self.dropout2(out)
        return residual + out


class TabularEncoder(nn.Module):
    """
    TabResNet Encoder mapping 328 clinical/demographic features to query embedding (B, 1, 256).
    """
    def __init__(self, num_features: int = 328, hidden_dim: int = 256, dropout: float = 0.2, num_blocks: int = 2):
        super().__init__()
        self.input_proj = nn.Sequential(
            nn.Linear(num_features, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU()
        )
        self.res_blocks = nn.ModuleList([
            TabularResNetBlock(hidden_dim, dropout=dropout)
            for _ in range(num_blocks)
        ])
        self.final_norm = nn.LayerNorm(hidden_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.input_proj(x)
        for block in self.res_blocks:
            h = block(h)
        token = self.final_norm(h)
        return token.unsqueeze(1)  # (B, 1, hidden_dim)


class AdaptiveModalityGatingUnit(nn.Module):
    """
    Adaptive Modality Gating Unit (AMGU).
    Dynamically modulates the fusion ratio between tabular state and cross-attended 3D imaging:
        g = Sigmoid(W_g [q; a] + b_g)
        h = LayerNorm((1 - g) * q + g * a)
    """
    def __init__(self, hidden_dim: int):
        super().__init__()
        self.gate_fc = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Sigmoid()
        )
        self.layer_norm = nn.LayerNorm(hidden_dim)

    def forward(self, query_feat: torch.Tensor, attended_feat: torch.Tensor):
        combined = torch.cat([query_feat, attended_feat], dim=-1)
        gate = self.gate_fc(combined)
        fused = (1.0 - gate) * query_feat + gate * attended_feat
        out = self.layer_norm(fused)
        return out, gate


class NeuroCrossVelocityNet(nn.Module):
    """
    NeuroCross-VelocityNet:
    Causal Cross-Modal Attention with Spatio-Temporal Progression Velocity Modeling,
    AMGU Dynamic Modality Gating, and Wide Linear Highway Projections.
    """
    def __init__(
        self,
        num_features: int = 328,
        hidden_dim: int = 256,
        num_heads: int = 4,
        dropout: float = 0.2,
        missing_strategy: str = 'token',
        modality_dropout_probability: float = 0.5,
        progression_horizons: int = 3
    ):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.missing_strategy = missing_strategy
        self.modality_dropout_probability = modality_dropout_probability
        self.progression_horizons = progression_horizons

        # 1. Encoders
        self.image_encoder = Lightweight3DCNN(in_channels=1, hidden_dim=hidden_dim)
        self.tabular_encoder = TabularEncoder(num_features=num_features, hidden_dim=hidden_dim, dropout=dropout)

        # 2. Modality Availability Embedding (0 = Missing, 1 = Available)
        self.availability_embedding = nn.Embedding(2, hidden_dim)

        # 3. Learnable Missing Modality Prompt Token
        self.missing_image_token = nn.Parameter(torch.randn(1, 1, hidden_dim) * 0.02)

        # 3b. 3D Spatial Self-Attention
        self.spatial_self_attention = nn.MultiheadAttention(
            embed_dim=hidden_dim,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True
        )
        self.spatial_norm = nn.LayerNorm(hidden_dim)

        # 4. Asymmetric Cross-Attention Bridge
        self.cross_attention = nn.MultiheadAttention(
            embed_dim=hidden_dim,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True
        )

        # 5. Adaptive Modality Gating Unit (AMGU)
        self.amgu = AdaptiveModalityGatingUnit(hidden_dim=hidden_dim)

        # 6. Multi-Task Output Heads
        self.stage_head = nn.Sequential(
            nn.Linear(hidden_dim, 128),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(128, 4)
        )
        self.severity_head = nn.Sequential(
            nn.Linear(hidden_dim, 128),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(128, 1)
        )
        self.velocity_head = nn.Sequential(
            nn.Linear(hidden_dim, 128),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(128, progression_horizons)
        )

        # 7. Wide Highway Projections
        self.wide_stage = nn.Linear(num_features, 4, bias=False)
        self.wide_severity = nn.Linear(num_features, 1, bias=False)
        self.wide_velocity = nn.Linear(num_features, progression_horizons, bias=False)

    def forward(
        self,
        image_tensor: torch.Tensor,
        tabular_tensor: torch.Tensor,
        has_image_mask: torch.Tensor,
        return_explainability: bool = False
    ):
        b = tabular_tensor.size(0)
        device = tabular_tensor.device

        effective_mask = has_image_mask.clone()
        if self.training and self.missing_strategy in ['dropout', 'token']:
            rand_tensor = torch.rand(b, device=device)
            drop_mask = (rand_tensor < self.modality_dropout_probability)
            effective_mask = effective_mask & (~drop_mask)

        # 1. Encode Tabular Query & Availability Prompt
        tab_query = self.tabular_encoder(tabular_tensor)  # (B, 1, hidden_dim)
        avail_idx = effective_mask.long()
        avail_emb = self.availability_embedding(avail_idx).unsqueeze(1)
        tab_query = tab_query + avail_emb

        # 2. Encode 3D Image Spatial Memory Tokens
        spatial_tokens = 448  # (8 * 8 * 7)
        img_memory = torch.zeros(b, spatial_tokens, self.hidden_dim, device=device, dtype=tab_query.dtype)
        image_tokens = None

        if effective_mask.any():
            valid_images = image_tensor[effective_mask]
            raw_tokens = self.image_encoder(valid_images).to(dtype=tab_query.dtype)
            sa_tokens, _ = self.spatial_self_attention(raw_tokens, raw_tokens, raw_tokens)
            valid_tokens = self.spatial_norm(raw_tokens + sa_tokens)
            image_tokens = valid_tokens
            img_memory[effective_mask] = valid_tokens

        # 3. Handle Missing Modality via Learnable Prompt Token
        missing_mask = ~effective_mask
        if missing_mask.any():
            missing_tokens = self.missing_image_token.to(dtype=tab_query.dtype).expand(missing_mask.sum(), spatial_tokens, -1)
            img_memory[missing_mask] = missing_tokens

        # 4. Cross-Attention
        attn_out, attn_weights = self.cross_attention(
            query=tab_query,
            key=img_memory,
            value=img_memory,
            need_weights=True
        )

        # 5. Adaptive Modality Gating Unit (AMGU)
        q_flat = tab_query.squeeze(1)
        a_flat = attn_out.squeeze(1)
        fused_embedding, gate_weights = self.amgu(q_flat, a_flat)

        # 6. Wide & Deep Predictions
        wide_stage = self.wide_stage(tabular_tensor).to(dtype=fused_embedding.dtype)
        wide_sev = self.wide_severity(tabular_tensor).squeeze(-1).to(dtype=fused_embedding.dtype)
        wide_vel = self.wide_velocity(tabular_tensor).to(dtype=fused_embedding.dtype)

        stage_logits = self.stage_head(fused_embedding) + wide_stage
        severity_pred = self.severity_head(fused_embedding).squeeze(-1) + wide_sev
        progression_pred = self.velocity_head(fused_embedding) + wide_vel

        out = {
            'stage': stage_logits,
            'severity': severity_pred,
            'progression': progression_pred
        }

        if return_explainability:
            out.update({
                'image_features': image_tokens,
                'attention_weights': attn_weights,
                'gate_weights': gate_weights,
                'tabular_embeddings': q_flat,
                'fusion_embedding': fused_embedding
            })

        return out
