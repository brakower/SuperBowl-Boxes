import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const createEmptyEntries = () => Array.from({ length: TOTAL_CELLS }, () => "");

const shuffleDigits = () => {
  const digits = Array.from({ length: GRID_SIZE }, (_, i) => i);
  for (let i = digits.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
};

export type BoxesState = {
  entries: string[];
  selectedIndex: number | null;
  rowDigits: Array<number | null>;
  colDigits: Array<number | null>;
};

const initialState: BoxesState = {
  entries: createEmptyEntries(),
  selectedIndex: null,
  rowDigits: Array.from({ length: GRID_SIZE }, () => null),
  colDigits: Array.from({ length: GRID_SIZE }, () => null),
};

const boxesSlice = createSlice({
  name: "boxes",
  initialState,
  reducers: {
    setEntries(state, action: PayloadAction<string[]>) {
      if (action.payload.length !== TOTAL_CELLS) {
        return;
      }
      state.entries = action.payload;
    },
    setDigits(
      state,
      action: PayloadAction<{
        rowDigits: Array<number | null>;
        colDigits: Array<number | null>;
      }>,
    ) {
      state.rowDigits = action.payload.rowDigits;
      state.colDigits = action.payload.colDigits;
    },
    selectBox(state, action: PayloadAction<number | null>) {
      state.selectedIndex = action.payload;
    },
    setEntry(state, action: PayloadAction<{ index: number; name: string }>) {
      const { index, name } = action.payload;
      if (index < 0 || index >= state.entries.length) {
        return;
      }
      state.entries[index] = name;
    },
    clearEntry(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (index < 0 || index >= state.entries.length) {
        return;
      }
      state.entries[index] = "";
    },
    clearAll(state) {
      state.entries = createEmptyEntries();
      state.selectedIndex = null;
    },
    randomizeDigits(state) {
      state.rowDigits = shuffleDigits();
      state.colDigits = shuffleDigits();
    },
  },
});

export const {
  setEntries,
  setDigits,
  selectBox,
  setEntry,
  clearEntry,
  clearAll,
  randomizeDigits,
} = boxesSlice.actions;

export default boxesSlice.reducer;
