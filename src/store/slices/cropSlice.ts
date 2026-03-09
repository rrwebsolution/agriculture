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

    // 🌟 ADD CROP RECORD (Gibuwat nga separate action para sa Real-time)
    addCrop: (state, action: PayloadAction<any>) => {
      // 🛡️ Prevent duplicates: I-check kung naa na ba ni nga ID sa state
      const exists = state.records.find((c) => c.id === action.payload.id);
      
      // Kung wala pa, i-unshift (ibutang sa pinaka-una)
      if (!exists) {
        state.records.unshift(action.payload);
      }
    },

    // 🌟 EDIT CROP RECORD (Gikuha ang { data, mode } wrapper)
    updateCropRecord: (state, action: PayloadAction<any>) => {
      const updatedCrop = action.payload;
      const index = state.records.findIndex((c) => c.id === updatedCrop.id);
      
      if (index !== -1) {
        state.records[index] = updatedCrop; // I-replace ang old data sa new data
      }
    },

    // 🌟 DELETE CROP RECORD
    deleteCropRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((c) => c.id !== action.payload);
    },
  },
});

export const { setCropData, addCrop, updateCropRecord, deleteCropRecord } = cropSlice.actions;
export default cropSlice.reducer;