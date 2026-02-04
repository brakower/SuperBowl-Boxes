# Superbowl Boxes

Modern, sporty Superbowl Boxes app built with React, Vite, TypeScript, and Redux Toolkit. Users can claim a square by entering their name, randomize score digits, and track winners by quarter.

## Features

- $10\times10$ grid with randomized score digits
- Click-to-select boxes and save names
- Clear and reset actions
- Responsive, NFL-inspired styling

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## State Management

Redux Toolkit stores box entries, selected square, and randomized digits. See:

- [src/boxesSlice.ts](src/boxesSlice.ts)
- [src/store.ts](src/store.ts)

## Realtime Sync (PostgreSQL via Supabase)

Set the following environment variables in a local .env file or in your hosting provider:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Create these tables in your PostgreSQL database (Supabase recommended):

- boxes (id int primary key, name text)
- digit_settings (id int primary key, row_digits jsonb, col_digits jsonb)

The app reads/writes:

- boxes: one row per square (id 0–99)
- digit_settings: a single row with id=1
