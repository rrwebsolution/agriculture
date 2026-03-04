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
    setFisherfolksData: (state, action: PayloadAction<{ records: any[]; barangays: any[] }>) => {
      state.records = action.payload.records;
      state.barangays = action.payload.barangays;
      state.isLoaded = true;
    },
    updateFisherfolkRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
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

export const { setFisherfolksData, updateFisherfolkRecord } = fisherfolkSlice.actions;
export default fisherfolkSlice.reducer;