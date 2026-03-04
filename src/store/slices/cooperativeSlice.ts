import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CoopState {
  records: any[];
  barangays: any[];
  isLoaded: boolean;
}

const initialState: CoopState = {
  records: [],
  barangays: [],
  isLoaded: false,
};

const cooperativeSlice = createSlice({
  name: 'cooperative',
  initialState,
  reducers: {
    setCoopData: (state, action: PayloadAction<{ records: any[]; barangays: any[] }>) => {
      state.records = action.payload.records;
      state.barangays = action.payload.barangays;
      state.isLoaded = true;
    },
    updateCoopRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' | 'delete' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        state.records.unshift(data);
      } else if (mode === 'edit') {
        const index = state.records.findIndex((r) => r.id === data.id);
        if (index !== -1) state.records[index] = data;
      } else if (mode === 'delete') {
        state.records = state.records.filter((r) => r.id !== data);
      }
    },
  },
});

export const { setCoopData, updateCoopRecord } = cooperativeSlice.actions;
export default cooperativeSlice.reducer;