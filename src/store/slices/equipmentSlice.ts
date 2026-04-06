import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface EquipmentState {
  records: any[];
  isLoaded: boolean;
}

const initialState: EquipmentState = {
  records: [],
  isLoaded: false,
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setEquipmentData: (state, action: PayloadAction<any[]>) => {
      state.records = action.payload;
      state.isLoaded = true;
    },
    updateEquipmentRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        const exists = state.records.find((r) => r.id === data.id);
        if (!exists) state.records.unshift(data);
      } else {
        const index = state.records.findIndex((r) => r.id === data.id);
        if (index !== -1) state.records[index] = { ...state.records[index], ...data };
      }
    },
    deleteEquipmentRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
  },
});

export const { setEquipmentData, updateEquipmentRecord, deleteEquipmentRecord } = equipmentSlice.actions;
export default equipmentSlice.reducer;