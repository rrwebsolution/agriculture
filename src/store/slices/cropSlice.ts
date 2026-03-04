import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CropState {
  records: any[];
  isLoaded: boolean;
}

const initialState: CropState = {
  records: [],
  isLoaded: false,
};

const cropSlice = createSlice({
  name: 'crop',
  initialState,
  reducers: {
    // 🌟 INITIAL LOAD OF CROPS
    setCropData: (state, action: PayloadAction<{ records: any[] }>) => {
      state.records = action.payload.records;
      state.isLoaded = true;
    },

    // 🌟 ADD OR EDIT CROP RECORD
    updateCropRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        state.records.unshift(data);
      } else {
        const index = state.records.findIndex((c) => c.id === data.id);
        if (index !== -1) {
          state.records[index] = data;
        }
      }
    },

    // 🌟 DELETE CROP RECORD
    deleteCropRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((c) => c.id !== action.payload);
    },
  },
});

export const { setCropData, updateCropRecord, deleteCropRecord } = cropSlice.actions;
export default cropSlice.reducer;