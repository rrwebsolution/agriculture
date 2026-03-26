import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FisherfolkState {
  records: any[];
  barangays: any[];
  cooperatives: any[]; // 🌟 Gidugang
  isLoaded: boolean;
}

const initialState: FisherfolkState = {
  records: [],
  barangays: [],
  cooperatives: [], // 🌟 Gidugang
  isLoaded: false,
};

const fisherfolkSlice = createSlice({
  name: 'fisherfolk',
  initialState,
  reducers: {
    // 🌟 Gi-update aron modawat og cooperatives
    setFisherfolksData: (
      state,
      action: PayloadAction<{ records: any[]; barangays: any[]; cooperatives: any[] }>
    ) => {
      state.records = action.payload.records;
      state.barangays = action.payload.barangays;
      state.cooperatives = action.payload.cooperatives;
      state.isLoaded = true;
    },

    addFisherfolk: (state, action: PayloadAction<any>) => {
      const exists = state.records.find(f => f.id === action.payload.id);
      if (!exists) {
        state.records.unshift(action.payload);
      }
    },

    updateFisherfolkRecord: (state, action: PayloadAction<any>) => {
      const updated = action.payload.data || action.payload;
      const index = state.records.findIndex((f) => f.id === updated.id);
      if (index !== -1) {
        state.records[index] = { ...state.records[index], ...updated };
      }
    },

    deleteFisherfolk: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((f) => f.id !== action.payload);
    },

    updateFisherfolkBarangayList: (state, action: PayloadAction<{ barangay: any; type: string }>) => {
      const { barangay, type } = action.payload;
      if (type === 'created') {
        state.barangays.push(barangay);
      } else if (type === 'updated') {
        state.barangays = state.barangays.map(b => b.id === barangay.id ? { ...b, ...barangay } : b);
      } else if (type === 'deleted') {
        state.barangays = state.barangays.filter(b => b.id !== barangay.id);
      }
    },

    // 🌟 BAG-O: Real-time update para sa Cooperative list kung gikinahanglan
    updateCooperativeList: (state, action: PayloadAction<{ coops: any[] }>) => {
        state.cooperatives = action.payload.coops;
    }
  },
});

export const {
  setFisherfolksData,
  addFisherfolk,
  updateFisherfolkRecord,
  deleteFisherfolk,
  updateFisherfolkBarangayList,
  updateCooperativeList 
} = fisherfolkSlice.actions;

export default fisherfolkSlice.reducer;