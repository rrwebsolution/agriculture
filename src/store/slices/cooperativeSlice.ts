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

    addCooperative: (state, action: PayloadAction<any>) => {
      const exists = state.records.find(r => r.id === action.payload.id);
      if (!exists) {
        state.records.unshift(action.payload);
      }
    },

    updateCooperativeRecord: (state, action: PayloadAction<any>) => {
      const updated = action.payload;
      const index = state.records.findIndex(r => r.id === updated.id);
      if (index !== -1) {
        state.records[index] = updated;
      }
    },

    deleteCooperative: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter(r => r.id !== action.payload);
    },

    // 🌟 BAG-O: SYNC BARANGAY DROPDOWN PARA SA COOPERATIVE
    updateCoopBarangayList: (state, action: PayloadAction<{ barangay: any; type: string }>) => {
      const { barangay, type } = action.payload;
      if (type === 'created') {
        state.barangays.push(barangay);
      } else if (type === 'updated') {
        state.barangays = state.barangays.map(b => 
          b.id === barangay.id ? { ...b, ...barangay } : b
        );
      } else if (type === 'deleted') {
        state.barangays = state.barangays.filter(b => b.id !== barangay.id);
      }
    },
  },
});

export const {
  setCoopData,
  addCooperative,
  updateCooperativeRecord,
  deleteCooperative,
  updateCoopBarangayList // 🌟 I-EXPORT NI
} = cooperativeSlice.actions;

export default cooperativeSlice.reducer;