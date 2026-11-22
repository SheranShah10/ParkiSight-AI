import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'ParkiSight-AI — Explainable Parkinson’s Disease Progression Research',
  description: 'An award-caliber multimodal clinical decision support research platform coupling 3D DaTSCAN SPECT, longitudinal clinical history, and explainable neural routing under anti-leakage constraints.',
  keywords: ['Parkinson’s disease', 'Multimodal deep learning', 'DaTSCAN SPECT', 'Clinical Decision Support', 'Explainable AI', 'PPMI', 'Neuroimaging', 'PDBP'],
  authors: [{ name: 'Muhammad Sheran Ali Bukhari' }, { name: 'Dr. Farman Ali' }],
  openGraph: {
    title: 'ParkiSight-AI — Explainable Parkinson’s Research Platform',
    description: 'Knowledge-Based Multimodal and Missing-Modality Decision Support for Parkinson’s Disease Staging and Progression.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ParkiSight-AI',
  },
};

export const viewport: Viewport = {
  themeColor: '#111514',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
