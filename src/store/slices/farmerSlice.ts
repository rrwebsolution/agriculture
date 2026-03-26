import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define clear interfaces (replace 'any' with your actual types if you have them)
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
    setFarmerData: (
      state, 
      action: PayloadAction<{ records: any[]; barangays: any[]; crops: any[]; cooperatives: any[] }>
    ) => {
      state.records = action.payload.records;
      state.barangays = action.payload.barangays;
      state.crops = action.payload.crops;
      state.cooperatives = action.payload.cooperatives;
      state.isLoaded = true;
    },

    updateFarmerRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        const exists = state.records.find((f) => f.id === data.id);
        if (!exists) state.records.unshift(data);
      } else if (mode === 'edit') {
        const index = state.records.findIndex((f) => f.id === data.id);
        if (index !== -1) {
          // Merging ensures we don't lose data if the backend returns a partial object
          state.records[index] = { ...state.records[index], ...data };
        }
      }
    },

    deleteFarmerRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((f) => f.id !== action.payload);
    },

    // 🌟 ADDED MISSING TYPESCRIPT PAYLOADACTIONS HERE
    updateFarmerBarangayList: (
      state, 
      action: PayloadAction<{ barangay: any; type: 'created' | 'updated' | 'deleted' }>
    ) => {
      const { barangay, type } = action.payload;
      if (type === 'created') state.barangays.push(barangay);
      if (type === 'updated') {
        state.barangays = state.barangays.map(b => b.id === barangay.id ? { ...b, ...barangay } : b);
      }
      if (type === 'deleted') state.barangays = state.barangays.filter(b => b.id !== barangay.id);
    },

    updateFarmerCropList: (
      state, 
      action: PayloadAction<{ crop: any; type: 'created' | 'updated' | 'deleted' }>
    ) => {
      const { crop, type } = action.payload;
      if (type === 'created') state.crops.push(crop);
      if (type === 'updated') {
        state.crops = state.crops.map(c => c.id === crop.id ? { ...c, ...crop } : c);
      }
      if (type === 'deleted') state.crops = state.crops.filter(c => c.id !== crop.id);
    },

    updateFarmerCoopList: (
      state, 
      action: PayloadAction<{ cooperative: any; type: 'created' | 'updated' | 'deleted' }>
    ) => {
      const { cooperative, type } = action.payload;
      if (type === 'created') state.cooperatives.push(cooperative);
      if (type === 'updated') {
        state.cooperatives = state.cooperatives.map(c => c.id === cooperative.id ? { ...c, ...cooperative } : c);
      }
      if (type === 'deleted') state.cooperatives = state.cooperatives.filter(c => c.id !== cooperative.id);
    },

    resetFarmerState: (state) => {
      state.records = [];
      state.barangays = [];
      state.crops = [];
      state.cooperatives = [];
      state.isLoaded = false;
    },
  },
});

export const {
  setFarmerData, 
  updateFarmerRecord, 
  deleteFarmerRecord,
  updateFarmerBarangayList, 
  updateFarmerCropList, 
  updateFarmerCoopList,
  resetFarmerState,
} = farmerSlice.actions;

export default farmerSlice.reducer;