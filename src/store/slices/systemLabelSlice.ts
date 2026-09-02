import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SystemLabelState {
  map: Record<string, string>;
  isLoaded: boolean;
}

const initialState: SystemLabelState = {
  map: {},
  isLoaded: false,
};

const systemLabelSlice = createSlice({
  name: 'systemLabel',
  initialState,
  reducers: {
    setSystemLabels: (state, action: PayloadAction<{ map: Record<string, string> }>) => {
      state.map = action.payload.map;
      state.isLoaded = true;
    },

    setSystemLabel: (state, action: PayloadAction<{ key: string; value: string }>) => {
      state.map[action.payload.key] = action.payload.value;
    },

    resetSystemLabel: (state, action: PayloadAction<{ key: string; defaultValue: string }>) => {
      state.map[action.payload.key] = action.payload.defaultValue;
    },
  },
});

export const { setSystemLabels, setSystemLabel, resetSystemLabel } = systemLabelSlice.actions;
export default systemLabelSlice.reducer;
