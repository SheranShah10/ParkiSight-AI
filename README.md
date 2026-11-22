# ParkiSight-AI

Next.js App Router prototype for the ParkiSight-AI clinical decision support research interface.

The landing experience uses a procedural React Three Fiber neural scene, scroll-linked with GSAP ScrollTrigger, plus reduced-motion and narrow-screen layouts. Motion direction was informed by the immersive project storytelling on Active Theory and Lusion.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` — research landing page, model overview, and study evidence.
- `/auth` — role selection and demo workspace entry.
- `/dashboard` — clinician, patient, and researcher demo workspaces. Role selection is carried in the `role` query string.

The workspace is a front-end prototype. Its controls update illustrative outputs locally; it does not call an inference service, store accounts or patient data, or produce clinically validated predictions. Reported study metrics are presented as study results, while patient-level figures in the dashboard are explicitly demo estimates.
