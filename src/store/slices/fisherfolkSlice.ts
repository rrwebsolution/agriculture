import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FisherfolkState {
  records: any[];
  barangays: any[];
  cooperatives: any[];
  isLoaded: boolean;
}

const initialState: FisherfolkState = {
  records: [],
  barangays: [],
  cooperatives: [],
  isLoaded: false,
};

const normalizeId = (value: unknown) => Number(value);
const getCatchRecords = (fisherfolk: any) => {
  if (Array.isArray(fisherfolk?.catchRecords)) return fisherfolk.catchRecords;
  if (Array.isArray(fisherfolk?.catch_records)) return fisherfolk.catch_records;
  return [];
};

const fisherfolkSlice = createSlice({
  name: 'fisherfolk',
  initialState,
  reducers: {
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

    updateFisherfolkCoopList: (
      state,
      action: PayloadAction<{ cooperative: any; type: 'created' | 'updated' | 'deleted' }>
    ) => {
      const { cooperative, type } = action.payload;
      const index = state.cooperatives.findIndex(c => c.id === cooperative.id);

      if (type === 'created' || type === 'updated') {
        if (index === -1) {
          state.cooperatives.unshift(cooperative);
        } else {
          state.cooperatives[index] = { ...state.cooperatives[index], ...cooperative };
        }
      }

      if (type === 'deleted') {
        state.cooperatives = state.cooperatives.filter(c => c.id !== cooperative.id);
      }
    },

    updateFisherfolkCatchRecord: (
      state,
      action: PayloadAction<{ fishery: any; type: 'created' | 'updated' | 'deleted' }>
    ) => {
      const { fishery, type } = action.payload;
      const targetFishrId = String(fishery?.fishr_id || '').trim();

      if (!targetFishrId) return;

      state.records = state.records.map((fisherfolk) => {
        if (String(fisherfolk?.system_id || '').trim() !== targetFishrId) {
          return fisherfolk;
        }

        const existingRecords = getCatchRecords(fisherfolk);
        let nextRecords = existingRecords;

        if (type === 'created') {
          const exists = existingRecords.find((record: any) => normalizeId(record.id) === normalizeId(fishery.id));
          nextRecords = exists ? existingRecords.map((record: any) => normalizeId(record.id) === normalizeId(fishery.id) ? { ...record, ...fishery } : record) : [fishery, ...existingRecords];
        }

        if (type === 'updated') {
          const index = existingRecords.findIndex((record: any) => normalizeId(record.id) === normalizeId(fishery.id));
          nextRecords = index === -1
            ? [fishery, ...existingRecords]
            : existingRecords.map((record: any) => normalizeId(record.id) === normalizeId(fishery.id) ? { ...record, ...fishery } : record);
        }

        if (type === 'deleted') {
          nextRecords = existingRecords.filter((record: any) => normalizeId(record.id) !== normalizeId(fishery.id));
        }

        return {
          ...fisherfolk,
          catchRecords: nextRecords,
          catch_records: nextRecords,
        };
      });
    }
  },
});

export const {
  setFisherfolksData,
  addFisherfolk,
  updateFisherfolkRecord,
  deleteFisherfolk,
  updateFisherfolkBarangayList,
  updateFisherfolkCoopList,
  updateFisherfolkCatchRecord
} = fisherfolkSlice.actions;

export default fisherfolkSlice.reducer;
