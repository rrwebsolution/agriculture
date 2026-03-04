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
    // 🌟 I-SET ANG DATA GIKAN SA API
    setClusterData: (state, action: PayloadAction<{ records: any[] }>) => {
      state.records = action.payload.records;
      state.isLoaded = true; // ✅ Mopugong ni nga mo-load usab ang API kung naa nay data
    },

    // 🌟 ADD OR EDIT CLUSTER RECORD
    updateClusterRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        // Ibutang sa pinaka-una ang bag-ong data
        state.records.unshift(data);
      } else {
        // Pangitaon ang index unya i-replace ang karaang data
        const index = state.records.findIndex((c) => c.id === data.id);
        if (index !== -1) {
          state.records[index] = data;
        }
      }
    },

    // 🌟 DELETE CLUSTER RECORD
    deleteClusterRecord: (state, action: PayloadAction<number>) => {
      // Wagtangon ang cluster base sa ID
      state.records = state.records.filter((c) => c.id !== action.payload);
    },
  },
});

export const { setClusterData, updateClusterRecord, deleteClusterRecord } = clusterSlice.actions;
export default clusterSlice.reducer;