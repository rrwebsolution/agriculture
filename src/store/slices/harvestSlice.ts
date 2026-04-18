import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface HarvestFilters {
  search: string;
  quality: string;
  startDate: string;
  endDate: string;
}

interface HarvestState {
  records: any[];
  farmers: any[];   // 🌟 BAG-O
  barangays: any[]; // 🌟 BAG-O
  crops: any[];     // 🌟 BAG-O
  isLoaded: boolean;
  filters: HarvestFilters;
  currentPage: number;
}

const initialState: HarvestState = {
  records: [],
  farmers: [],
  barangays: [],
  crops: [],
  isLoaded: false,
  filters: {
    search: '',
    quality: 'All Qualities',
    startDate: '',
    endDate: '',
  },
  currentPage: 1,
};

const harvestSlice = createSlice({
  name: 'harvest',
  initialState,
  reducers: {
    // 🌟 UPDATED: Modawat na siyag object nga naay lists apil
    setHarvestData: (state, action: PayloadAction<{ records: any[], farmers: any[], barangays: any[], crops: any[] }>) => {
      state.records = action.payload.records;
      state.farmers = action.payload.farmers;
      state.barangays = action.payload.barangays;
      state.crops = action.payload.crops;
      state.isLoaded = true;
    },
    addHarvestRecord: (state, action: PayloadAction<any>) => {
      state.records.unshift(action.payload);
    },
    updateHarvestRecord: (state, action: PayloadAction<any>) => {
      const index = state.records.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    syncHarvestReference: (state, action: PayloadAction<any>) => {
      const payload = action.payload;

      if (payload.farmer) {
        const farmerId = Number(payload.farmer.id);
        const farmerIndex = state.farmers.findIndex((f) => Number(f.id) === farmerId);

        if (farmerIndex !== -1) {
          state.farmers[farmerIndex] = { ...state.farmers[farmerIndex], ...payload.farmer };
        } else {
          state.farmers.unshift(payload.farmer);
        }

        state.records = state.records.map((record) => {
          if (Number(record.farmer_id) !== farmerId) return record;

          return {
            ...record,
            farmer: { ...(record.farmer || {}), ...payload.farmer },
          };
        });
      }

      if (payload.barangay) {
        const barangayId = Number(payload.barangay.id);
        const barangayIndex = state.barangays.findIndex((b) => Number(b.id) === barangayId);

        if (barangayIndex !== -1) {
          state.barangays[barangayIndex] = { ...state.barangays[barangayIndex], ...payload.barangay };
        } else {
          state.barangays.push(payload.barangay);
        }

        state.records = state.records.map((record) => {
          if (Number(record.barangay_id) !== barangayId) return record;

          return {
            ...record,
            barangay: { ...(record.barangay || {}), ...payload.barangay },
          };
        });
      }

      if (payload.crop) {
        const cropId = Number(payload.crop.id);
        const cropIndex = state.crops.findIndex((c) => Number(c.id) === cropId);

        if (cropIndex !== -1) {
          state.crops[cropIndex] = { ...state.crops[cropIndex], ...payload.crop };
        } else {
          state.crops.push(payload.crop);
        }

        state.records = state.records.map((record) => {
          if (Number(record.crop_id) !== cropId) return record;

          return {
            ...record,
            crop: { ...(record.crop || {}), ...payload.crop },
          };
        });
      }

      if (payload.deleted_barangay_id) {
        state.barangays = state.barangays.filter((b) => Number(b.id) !== Number(payload.deleted_barangay_id));
      }

      if (payload.deleted_crop_id) {
        state.crops = state.crops.filter((c) => Number(c.id) !== Number(payload.deleted_crop_id));
      }
    },
    deleteHarvestRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
    setHarvestFilters: (state, action: PayloadAction<Partial<HarvestFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    setHarvestPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearHarvestFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    }
  },
});

export const { 
  setHarvestData, addHarvestRecord, updateHarvestRecord, syncHarvestReference, deleteHarvestRecord,
  setHarvestFilters, setHarvestPage, clearHarvestFilters 
} = harvestSlice.actions;

export default harvestSlice.reducer;
