import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ClusterState {
  records: any[];
  isLoaded: boolean;
}

const initialState: ClusterState = {
  records: [],
  isLoaded: false,
};

const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    setClusterData: (state, action: PayloadAction<{ records: any[] }>) => {
      state.records = action.payload.records;
      state.isLoaded = true;
    },
    updateClusterRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      
      if (mode === 'add') {
        // 🌟 KINI ANG FIX SA DUPLICATES: I-check usa kung nag-exist na ba ang ID una i-add
        const exists = state.records.find((r) => r.id === data.id);
        if (!exists) {
          state.records.unshift(data);
        }
      } else if (mode === 'edit') {
        const index = state.records.findIndex((r) => r.id === data.id);
        if (index !== -1) {
          state.records[index] = { ...state.records[index], ...data };
        }
      }
    },
    deleteClusterRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
  },
});

export const { setClusterData, updateClusterRecord, deleteClusterRecord } = clusterSlice.actions;
export default clusterSlice.reducer;