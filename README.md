# Tiruf Nurse Dashboard

A sleek, mobile-first nurse-side dashboard for browsing and applying to shifts in Addis Ababa, Ethiopia.

## Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- lucide-react, framer-motion, date-fns, recharts, zustand, clsx, tailwind-merge, class-variance-authority

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure
- src/types - TypeScript models
- src/data/mock.ts - Mock data layer
- src/services/shifts.ts - API-like service (swap with real API later)
- src/components - Reusable UI components
- src/app/nurse/* - Nurse screens (Home, Browse, My Shifts, Profile, Alerts)
- src/hooks - i18n + store
- src/locales - en/am translations

## Notes
- Earnings shown as "estimated" (Tiruf doesn't process payments)
- Map is placeholder (no Leaflet/Mapbox integrated yet)
- Swap services to call real backend; auth can plug into existing auth system
# Tiruf
