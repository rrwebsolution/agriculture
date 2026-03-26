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
  setHarvestData, addHarvestRecord, updateHarvestRecord, deleteHarvestRecord,
  setHarvestFilters, setHarvestPage, clearHarvestFilters 
} = harvestSlice.actions;

export default harvestSlice.reducer;