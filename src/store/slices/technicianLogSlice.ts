import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface TechnicianLogState {
  logs: any[];
  employees: any[];
  isLoaded: boolean;
  isLoading: boolean;
}

const initialState: TechnicianLogState = {
  logs: [],
  employees: [],
  isLoaded: false,
  isLoading: false,
};

const technicianLogSlice = createSlice({
  name: 'technicianLogs',
  initialState,
  reducers: {
    setTechnicianLogLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTechnicianLogData: (state, action: PayloadAction<{ logs: any[]; employees: any[] }>) => {
      state.logs = action.payload.logs;
      state.employees = action.payload.employees;
      state.isLoaded = true;
      state.isLoading = false;
    },
    upsertTechnicianLog: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        const exists = state.logs.find((log) => log.id === data.id);
        if (!exists) state.logs.unshift(data);
      } else {
        const index = state.logs.findIndex((log) => log.id === data.id);
        if (index !== -1) state.logs[index] = data;
        else state.logs.unshift(data);
      }
    },
    deleteTechnicianLogRecord: (state, action: PayloadAction<number>) => {
      state.logs = state.logs.filter((log) => log.id !== action.payload);
    },
    upsertTechnicianEmployee: (state, action: PayloadAction<any>) => {
      const employee = action.payload;
      const index = state.employees.findIndex((item) => item.id === employee.id);
      if (index === -1) state.employees.unshift(employee);
      else state.employees[index] = { ...state.employees[index], ...employee };
    },
    removeTechnicianEmployee: (state, action: PayloadAction<number>) => {
      state.employees = state.employees.filter((employee) => employee.id !== action.payload);
      state.logs = state.logs.map((log) =>
        log.employee_id === action.payload ? { ...log, employee: null } : log
      );
    },
    resetTechnicianLogState: () => initialState,
  },
});

export const {
  setTechnicianLogLoading,
  setTechnicianLogData,
  upsertTechnicianLog,
  deleteTechnicianLogRecord,
  upsertTechnicianEmployee,
  removeTechnicianEmployee,
  resetTechnicianLogState,
} = technicianLogSlice.actions;

export default technicianLogSlice.reducer;
