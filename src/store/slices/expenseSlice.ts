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

const normalizeId = (value: unknown) => Number(value);
const upsertRecord = (records: any[], record: any, prepend = false) => {
  const index = records.findIndex((item) => normalizeId(item.id) === normalizeId(record.id));

  if (index !== -1) {
    records[index] = { ...records[index], ...record };
    return;
  }

  if (prepend) {
    records.unshift(record);
    return;
  }

  records.push(record);
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
      state.activeRecords = action.payload.active.reduce((acc: any[], expense: any) => {
        upsertRecord(acc, expense);
        return acc;
      }, []);
      state.archivedRecords = action.payload.archived.reduce((acc: any[], expense: any) => {
        upsertRecord(acc, expense);
        return acc;
      }, []);
      // I-merge ang default values kung kinahanglan aron sigurado
      state.categories = Array.from(new Set(["Materials", "Fuel", "Maintenance", "Labor", "Office Supplies", ...action.payload.categories]));
      state.projects = Array.from(new Set(["Rice Program", "Corn Program", "Cacao Program", "Vegetable Program", "Fishery Program", "HVCDP", ...action.payload.projects]));
      state.isLoaded = true;
    },

    // 2. Add New Expense
    addExpense: (state, action: PayloadAction<any>) => {
      state.archivedRecords = state.archivedRecords.filter((record) => normalizeId(record.id) !== normalizeId(action.payload.id));
      upsertRecord(state.activeRecords, action.payload, true);
    },

    // 3. Update Existing Expense
    updateExpense: (state, action: PayloadAction<any>) => {
      const activeIndex = state.activeRecords.findIndex((r) => normalizeId(r.id) === normalizeId(action.payload.id));
      if (activeIndex !== -1) {
        state.activeRecords[activeIndex] = { ...state.activeRecords[activeIndex], ...action.payload };
        return;
      }

      const archivedIndex = state.archivedRecords.findIndex((r) => normalizeId(r.id) === normalizeId(action.payload.id));
      if (archivedIndex !== -1) {
        state.archivedRecords[archivedIndex] = { ...state.archivedRecords[archivedIndex], ...action.payload };
      }
    },

    // 4. Move to Archive (Soft Delete)
    archiveExpense: (state, action: PayloadAction<any>) => {
      const recordId = typeof action.payload === 'object' ? action.payload?.id : action.payload;
      const recordIndex = state.activeRecords.findIndex((r) => normalizeId(r.id) === normalizeId(recordId));
      if (recordIndex !== -1) {
        const deletedRecord = {
          ...state.activeRecords[recordIndex],
          ...(typeof action.payload === 'object' ? action.payload : {}),
          deleted_at: typeof action.payload === 'object' && action.payload?.deleted_at
            ? action.payload.deleted_at
            : new Date().toISOString()
        };
        state.activeRecords.splice(recordIndex, 1); // Kuhaon sa active
        upsertRecord(state.archivedRecords, deletedRecord, true);
        return;
      }

      if (typeof action.payload === 'object') {
        upsertRecord(state.archivedRecords, action.payload, true);
      }
    },

    // 5. Restore from Archive
    restoreExpense: (state, action: PayloadAction<any>) => {
      const recordIndex = state.archivedRecords.findIndex((r) => normalizeId(r.id) === normalizeId(action.payload.id));
      if (recordIndex !== -1) {
        state.archivedRecords.splice(recordIndex, 1); // Kuhaon sa archive
      }
      // Ibutang ang bag-ong na-restore nga data sa active
      upsertRecord(state.activeRecords, action.payload, true);
    },

    removeExpenseRecord: (state, action: PayloadAction<number>) => {
      state.activeRecords = state.activeRecords.filter((record) => normalizeId(record.id) !== normalizeId(action.payload));
      state.archivedRecords = state.archivedRecords.filter((record) => normalizeId(record.id) !== normalizeId(action.payload));
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
  removeExpenseRecord,
  addLocalCategory,
  addLocalProject
} = expenseSlice.actions;

export default expenseSlice.reducer;
