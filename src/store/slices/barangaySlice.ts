import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface BarangayState {
  records: any[];
  metrics: { total: number; urban: number; rural: number; coastal: number; };
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
    setBarangayData: (state, action: PayloadAction<{ records: any[]; metrics: any }>) => {
      state.records = action.payload.records;
      state.metrics = action.payload.metrics;
      state.isLoaded = true;
    },

    addBarangay: (state, action: PayloadAction<any>) => {
      // Sutaon una kung naa na bay susama aron di madoble
      const exists = state.records.find(r => Number(r.id) === Number(action.payload.id));
      if (!exists) {
        state.records.unshift(action.payload);
        state.metrics.total += 1;
        if (action.payload.type === 'Urban (Poblacion)') state.metrics.urban += 1;
        if (action.payload.type === 'Rural') state.metrics.rural += 1;
        if (action.payload.type === 'Coastal') state.metrics.coastal += 1;
      }
    },

    updateBarangayRecord: (state, action: PayloadAction<any>) => {
      const updated = action.payload;
      const index = state.records.findIndex(r => Number(r.id) === Number(updated.id));
      
      if (index !== -1) {
        const oldType = state.records[index].type;
        
        // I-merge ang data
        state.records[index] = { ...state.records[index], ...updated };

        // Kon na-usab ang tipo (e.g. gikan Rural padulong Coastal), i-adjust ang metrics
        if (updated.type && oldType !== updated.type) {
          if (oldType === 'Urban (Poblacion)') state.metrics.urban -= 1;
          if (oldType === 'Rural') state.metrics.rural -= 1;
          if (oldType === 'Coastal') state.metrics.coastal -= 1;

          if (updated.type === 'Urban (Poblacion)') state.metrics.urban += 1;
          if (updated.type === 'Rural') state.metrics.rural += 1;
          if (updated.type === 'Coastal') state.metrics.coastal += 1;
        }
      }
    },

    deleteBarangay: (state, action: PayloadAction<number>) => {
      const id = Number(action.payload);
      const existing = state.records.find((b) => Number(b.id) === id);
      if (existing) {
        state.records = state.records.filter((b) => Number(b.id) !== id);
        state.metrics.total -= 1;
        if (existing.type === 'Urban (Poblacion)') state.metrics.urban -= 1;
        if (existing.type === 'Rural') state.metrics.rural -= 1;
        if (existing.type === 'Coastal') state.metrics.coastal -= 1;
      }
    },
  },
});

export const { setBarangayData, addBarangay, updateBarangayRecord, deleteBarangay } = barangaySlice.actions;
export default barangaySlice.reducer;