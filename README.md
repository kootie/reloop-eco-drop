# Reloop Eco Drop

A modern web app for fast, gamified e-waste and plastic recycling via QR code deep links and interactive bin flows.

## Features

- **QR-to-Bin Flow:**
  - Scan a Reloop QR sticker to instantly land on a bin detail page.
  - Deep-link support: `/drop?bin={bin_id}` route.

- **Bin Detail Screen:**
  - Shows bin location on a static map with a pulsing marker and 5m accuracy circle.
  - Displays bin nickname, address, fill level, and last emptied time.
  - Capacity bar and live bin data (auto-refresh every 30s).
  - "Navigate" button opens native map app (Apple/Google Maps).

- **Accepted Items:**
  - E-waste bins: Horizontal chips for each device type, color-coded by toxicity, with icons and details.
  - Plastic bins: Simple info about accepted plastics (bottles, containers, etc.).

- **Drop Flow:**
  - "Drop Item" button opens camera + GPS proof modal.
  - Auto-captures GPS and guides user to include item in bin.
  - Instant points reward and toast notification.

- **Progress & Gamification:**
  - Points system for drops.
  - "View my points" and "Impact Stats" screens.

- **PWA Support:**
  - Detects if opened in PWA or browser.
  - Shows install banner for one-tap PWA install if not in app.
  - Offline-first: bin/device lists cached for fast access.

- **User Account:**
  - Phone number login and registration (with name field).
  - Settings modal: shows user info, last known location, device type, and allows updating/clearing location.

- **Modern UI:**
  - Responsive, mobile-first design.
  - Accessible, fast, and easy to use.

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```
2. Start the dev server:
   ```sh
   npm run dev
   # or
   bun run dev
   ```
3. Open the app in your browser and scan a QR code or use `/drop?bin=bin-001`.

## Notes
- For map images, set your Google Maps Static API key in the code where indicated.
- This is a demo/prototype; backend integration and real authentication are not yet implemented.
