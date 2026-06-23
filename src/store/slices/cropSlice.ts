import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CropRecord {
  id: number;
  category: string;
  [key: string]: unknown;
}

interface CropState {
  records: CropRecord[];
  isLoaded: boolean;
}

const initialState: CropState = {
  records: [],
  isLoaded: false,
};

const withoutAreasSuffix = (crop: CropRecord): CropRecord => ({
  ...crop,
  category: typeof crop.category === 'string'
    ? crop.category.replace(/\s+Areas$/i, '')
    : crop.category,
});

const cropSlice = createSlice({
  name: 'crop',
  initialState,
  reducers: {
    // 🌟 INITIAL LOAD OF CROPS
    setCropData: (state, action: PayloadAction<{ records: CropRecord[] }>) => {
      state.records = action.payload.records.map(withoutAreasSuffix);
      state.isLoaded = true;
    },

    // 🌟 ADD CROP RECORD (Gibuwat nga separate action para sa Real-time)
    addCrop: (state, action: PayloadAction<CropRecord>) => {
      // 🛡️ Prevent duplicates: I-check kung naa na ba ni nga ID sa state
      const crop = withoutAreasSuffix(action.payload);
      const exists = state.records.find((c) => c.id === crop.id);
      
      // Kung wala pa, i-unshift (ibutang sa pinaka-una)
      if (!exists) {
        state.records.unshift(crop);
      }
    },

    // 🌟 EDIT CROP RECORD (Gikuha ang { data, mode } wrapper)
    updateCropRecord: (state, action: PayloadAction<CropRecord>) => {
      const updatedCrop = withoutAreasSuffix(action.payload);
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
