import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface BarangayState {
  records: any[];
  metrics: {
    total: number;
    urban: number;
    rural: number;
    coastal: number;
  };
  isLoaded: boolean;
}

const initialState: BarangayState = {
  records: [],
  metrics: { total: 0, urban: 0, rural: 0, coastal: 0 },
  isLoaded: false,
};

const barangaySlice = createSlice({
  name: 'barangay',
  initialState,
  reducers: {

    // ✅ INITIAL LOAD
    setBarangayData: (
      state,
      action: PayloadAction<{ records: any[]; metrics: any }>
    ) => {
      state.records = action.payload.records;
      state.metrics = action.payload.metrics;
      state.isLoaded = true;
    },

    // ✅ ADD BARANGAY (REALTIME)
    addBarangay: (state, action: PayloadAction<any>) => {
      state.records.unshift(action.payload);
      state.metrics.total += 1;

      if (action.payload.type === 'Urban (Poblacion)') {
        state.metrics.urban += 1;
      }

      if (action.payload.type === 'Rural') {
        state.metrics.rural += 1;
      }

      if (action.payload.type === 'Coastal') {
        state.metrics.coastal += 1;
      }
    },

    // ✅ UPDATE BARANGAY (REALTIME)
    updateBarangayRecord: (state, action: PayloadAction<any>) => {
      const updated = action.payload;
      const index = state.records.findIndex((b) => b.id === updated.id);

      if (index !== -1) {
        state.records[index] = updated;
      }
    },

    // ✅ DELETE BARANGAY (REALTIME)
    deleteBarangay: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const existing = state.records.find((b) => b.id === id);

      if (existing) {
        state.records = state.records.filter((b) => b.id !== id);

        state.metrics.total -= 1;

        if (existing.type === 'Urban (Poblacion)') {
          state.metrics.urban -= 1;
        }

        if (existing.type === 'Rural') {
          state.metrics.rural -= 1;
        }

        if (existing.type === 'Coastal') {
          state.metrics.coastal -= 1;
        }
      }
    },
  },
});

export const {
  setBarangayData,
  addBarangay,
  updateBarangayRecord,
  deleteBarangay,
} = barangaySlice.actions;

export default barangaySlice.reducer;