import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FisheryState {
  records: any[];
  isLoaded: boolean;
}

const initialState: FisheryState = {
  records: [],
  isLoaded: false,
};

const fisherySlice = createSlice({
  name: 'fishery',
  initialState,
  reducers: {
    setFisheryData: (state, action: PayloadAction<any[]>) => {
      state.records = action.payload;
      state.isLoaded = true;
    },
    updateFisheryRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        const exists = state.records.find((r) => r.id === data.id);
        if (!exists) state.records.unshift(data);
      } else {
        const index = state.records.findIndex((r) => r.id === data.id);
        if (index !== -1) state.records[index] = { ...state.records[index], ...data };
      }
    },
    deleteFisheryRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
  },
});

export const { setFisheryData, updateFisheryRecord, deleteFisheryRecord } = fisherySlice.actions;
export default fisherySlice.reducer;