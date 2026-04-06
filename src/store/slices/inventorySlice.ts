import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface InventoryState {
  records: any[];
  farmers: any[];
  fisherfolks: any[];
  cooperatives: any[];
  isLoaded: boolean;
}

const initialState: InventoryState = {
  records: [],
  farmers: [],
  fisherfolks: [],
  cooperatives: [],
  isLoaded: false,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // 1. Initial Load (Gikan sa API index method)
    setInventoryData: (
      state, 
      action: PayloadAction<{
        inventories: any[];
        farmers: any[];
        fisherfolks: any[];
        cooperatives: any[];
      }>
    ) => {
      state.records = action.payload.inventories;
      state.farmers = action.payload.farmers;
      state.fisherfolks = action.payload.fisherfolks;
      state.cooperatives = action.payload.cooperatives;
      state.isLoaded = true;
    },

    // 2. Add o Edit og Inventory Item
    updateInventoryRecord: (
      state, 
      action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>
    ) => {
      const { data, mode } = action.payload;
      
      if (mode === 'add') {
        const exists = state.records.find((r) => r.id === data.id);
        if (!exists) state.records.unshift(data); // Ibutang sa ibabaw
      } else {
        const index = state.records.findIndex((r) => r.id === data.id);
        if (index !== -1) {
          // I-merge ang updated item sa existing data
          state.records[index] = { ...state.records[index], ...data };
        }
      }
    },

    // 3. Update sa Single Item human og Transaction o Revert
    // Kasagaran ang API mo-return sa tibuok item apil ang iyang 'transactions' relationship
    syncInventoryItem: (state, action: PayloadAction<any>) => {
      const index = state.records.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },

    // 4. Delete Inventory Item (Kon kinahanglan nimo puhon)
    deleteInventoryRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
  },
});

export const { 
  setInventoryData, 
  updateInventoryRecord, 
  syncInventoryItem, 
  deleteInventoryRecord 
} = inventorySlice.actions;

export default inventorySlice.reducer;