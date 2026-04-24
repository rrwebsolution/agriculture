import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface DangerZoneState {
  records: any[];
  isLoaded: boolean;
}

const initialState: DangerZoneState = {
  records: [],
  isLoaded: false,
};

const dangerZoneSlice = createSlice({
  name: 'dangerZone',
  initialState,
  reducers: {
    setDangerZoneData: (state, action: PayloadAction<{ records: any[] }>) => {
      state.records = action.payload.records;
      state.isLoaded = true;
    },
    updateDangerZoneRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;

      if (mode === 'add') {
        const exists = state.records.find((record) => record.id === data.id);
        if (!exists) {
          state.records.unshift(data);
        }
        return;
      }

      const index = state.records.findIndex((record) => record.id === data.id);
      if (index !== -1) {
        state.records[index] = { ...state.records[index], ...data };
      }
    },
    deleteDangerZoneRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((record) => record.id !== action.payload);
    },
  },
});

export const { setDangerZoneData, updateDangerZoneRecord, deleteDangerZoneRecord } = dangerZoneSlice.actions;
export default dangerZoneSlice.reducer;
