# Super Bowl Boxes

Super Bowl Boxes is a polished, real‑time web app for running a classic 10×10 squares pool. It focuses on a clean, mobile‑friendly UI, fast interactions, and reliable synchronization of box claims across devices. The project demonstrates frontend architecture, state management, and realtime data integration with a PostgreSQL backend.

Can be found online here: [https://super-bowl-boxes.vercel.app/](https://super-bowl-boxes.vercel.app/)

## Project overview

The app lets users:

- Claim a square on a 10×10 grid by entering their name
- See team labels and score digit headers
- View payment rules and payout structure
- Sync all selections in realtime so the board stays consistent across devices

The UI is designed with a sporty, NFL‑inspired theme while remaining readable and responsive. The grid supports horizontal scrolling on small screens to keep the full 10×10 experience intact on mobile.

## Engineering highlights

- **State modeling:** Redux Toolkit is used to model the grid entries, selected square, and digits, giving predictable state updates and clean reducer logic.
- **Realtime sync:** Supabase (PostgreSQL + realtime) broadcasts changes so any claim is reflected instantly for all users.
- **Type safety:** TypeScript enforces consistent data shapes for rows, digits, and payloads, reducing runtime errors.
- **Resilient UI:** The interface handles empty digits and unconfigured backend states gracefully.
- **Responsive layout:** The board and sidebar adapt to smaller screens without losing usability.

## Technology stack

- React + Vite for fast, modern UI development
- TypeScript for safety and clarity
- Redux Toolkit for centralized state management
- Supabase (PostgreSQL + realtime) for data persistence and live updates

## Why this project represents me well

This project demonstrates my ability to:

- Build a complete, user‑facing product with thoughtful UX
- Structure application state cleanly in Redux and keep UI in sync
- Integrate a realtime PostgreSQL backend with frontend state
- Design a polished, responsive UI for desktop and mobile
- Deliver a focused, production‑ready app with clear requirements
