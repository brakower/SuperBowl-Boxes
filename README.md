# Superbowl Boxes

Superbowl Boxes app for friends and family built with React, Vite, TypeScript, and Redux Toolkit. Users can claim a square by entering their name, randomize score digits, and track winners by quarter.

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
