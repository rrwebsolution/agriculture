import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ExpenseState {
  activeRecords: any[];
  archivedRecords: any[];
  categories: string[];
  projects: string[];
  isLoaded: boolean;
}

const initialState: ExpenseState = {
  activeRecords: [],
  archivedRecords: [],
  categories: [],
  projects: [],
  isLoaded: false,
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    // 1. Initial Load (Gikan sa API index method)
    setExpenseData: (
      state, 
      action: PayloadAction<{
        active: any[];
        archived: any[];
        categories: string[];
        projects: string[];
      }>
    ) => {
      state.activeRecords = action.payload.active;
      state.archivedRecords = action.payload.archived;
      // I-merge ang default values kung kinahanglan aron sigurado
      state.categories = Array.from(new Set(["Materials", "Fuel", "Maintenance", "Labor", "Office Supplies", ...action.payload.categories]));
      state.projects = Array.from(new Set(["Rice Program", "Corn Program", "Cacao Program", "Vegetable Program", "Fishery Program", "HVCDP", ...action.payload.projects]));
      state.isLoaded = true;
    },

    // 2. Add New Expense
    addExpense: (state, action: PayloadAction<any>) => {
      state.activeRecords.unshift(action.payload); // Ibutang sa ibabaw
    },

    // 3. Update Existing Expense
    updateExpense: (state, action: PayloadAction<any>) => {
      const index = state.activeRecords.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.activeRecords[index] = { ...state.activeRecords[index], ...action.payload };
      }
    },

    // 4. Move to Archive (Soft Delete)
    archiveExpense: (state, action: PayloadAction<number>) => {
      const recordIndex = state.activeRecords.findIndex((r) => r.id === action.payload);
      if (recordIndex !== -1) {
        const deletedRecord = { ...state.activeRecords[recordIndex], deleted_at: new Date().toISOString() };
        state.activeRecords.splice(recordIndex, 1); // Kuhaon sa active
        state.archivedRecords.unshift(deletedRecord); // Ibutang sa archive
      }
    },

    // 5. Restore from Archive
    restoreExpense: (state, action: PayloadAction<any>) => {
      const recordIndex = state.archivedRecords.findIndex((r) => r.id === action.payload.id);
      if (recordIndex !== -1) {
        state.archivedRecords.splice(recordIndex, 1); // Kuhaon sa archive
      }
      // Ibutang ang bag-ong na-restore nga data sa active
      state.activeRecords.unshift(action.payload); 
    },

    // 6. Dynamic add for Categories/Projects in the Modal
    addLocalCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    addLocalProject: (state, action: PayloadAction<string>) => {
      if (!state.projects.includes(action.payload)) {
        state.projects.push(action.payload);
      }
    }
  },
});

export const { 
  setExpenseData, 
  addExpense, 
  updateExpense, 
  archiveExpense, 
  restoreExpense,
  addLocalCategory,
  addLocalProject
} = expenseSlice.actions;

export default expenseSlice.reducer;