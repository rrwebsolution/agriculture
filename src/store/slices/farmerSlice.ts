import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FarmerState {
  records: any[];
  barangays: any[];
  crops: any[];
  cooperatives: any[];
  isLoaded: boolean;
}

const initialState: FarmerState = {
  records: [],
  barangays: [],
  crops: [],
  cooperatives: [],
  isLoaded: false,
};

const farmerSlice = createSlice({
  name: 'farmer',
  initialState,
  reducers: {
    setFarmerData: (state, action: PayloadAction<{ records: any[]; barangays: any[]; crops: any[]; cooperatives: any[] }>) => {
      state.records = action.payload.records;
      state.barangays = action.payload.barangays;
      state.crops = action.payload.crops;
      state.cooperatives = action.payload.cooperatives;
      state.isLoaded = true; // ✅ Mopugong ni nga mo-load usab ang API
    },
    updateFarmerRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        state.records.unshift(data);
      } else {
        const index = state.records.findIndex((f) => f.id === data.id);
        if (index !== -1) {
          state.records[index] = data;
        }
      }
    },
  },
});

export const { setFarmerData, updateFarmerRecord } = farmerSlice.actions;
export default farmerSlice.reducer;