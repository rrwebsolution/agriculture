import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FisherfolkState {
  records: any[];
  barangays: any[];
  isLoaded: boolean;
}

const initialState: FisherfolkState = {
  records: [],
  barangays: [],
  isLoaded: false,
};

const fisherfolkSlice = createSlice({
  name: 'fisherfolk',
  initialState,
  reducers: {
    setFisherfolksData: (
      state,
      action: PayloadAction<{ records: any[]; barangays: any[] }>
    ) => {
      state.records = action.payload.records;
      state.barangays = action.payload.barangays;
      state.isLoaded = true;
    },

    // ✅ ADD (Real-time created)
    addFisherfolk: (state, action: PayloadAction<any>) => {
      const exists = state.records.find(f => f.id === action.payload.id);
      if (!exists) {
        state.records.unshift(action.payload);
      }
    },

    // ✅ UPDATE (Real-time updated)
    updateFisherfolkRecord: (state, action: PayloadAction<any>) => {
      // Gi-handle ang scenario kung ang payload naay { data, mode } o raw object lang
      const updated = action.payload.data || action.payload;
      const index = state.records.findIndex((f) => f.id === updated.id);
      if (index !== -1) {
        state.records[index] = { ...state.records[index], ...updated };
      }
    },

    // ✅ DELETE (Real-time deleted)
    deleteFisherfolk: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((f) => f.id !== action.payload);
    },

    // 🌟 BAG-O: REAL-TIME SYNC PARA SA BARANGAY DROPDOWN
    updateFisherfolkBarangayList: (state, action: PayloadAction<{ barangay: any; type: string }>) => {
      const { barangay, type } = action.payload;

      if (type === 'created') {
        state.barangays.push(barangay);
      } 
      else if (type === 'updated') {
        // 🌟 KINI DAPAT: Mogamit og .map() para mapugos ang UI sa pag-update
        state.barangays = state.barangays.map(b => 
          b.id === barangay.id ? { ...b, ...barangay } : b
        );
      } 
      else if (type === 'deleted') {
        state.barangays = state.barangays.filter(b => b.id !== barangay.id);
      }
    },
  },
});

export const {
  setFisherfolksData,
  addFisherfolk,
  updateFisherfolkRecord,
  deleteFisherfolk,
  updateFisherfolkBarangayList 
} = fisherfolkSlice.actions;

export default fisherfolkSlice.reducer;