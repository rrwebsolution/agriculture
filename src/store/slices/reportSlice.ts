import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ReportState {
  records: any[];
  isLoaded: boolean;
}

const initialState: ReportState = {
  records: [],
  isLoaded: false,
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReportData: (state, action: PayloadAction<any[]>) => {
      state.records = action.payload;
      state.isLoaded = true;
    },
    addReport: (state, action: PayloadAction<any>) => {
      state.records.unshift(action.payload);
    },
    removeReport: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
  },
});

export const { setReportData, addReport, removeReport } = reportSlice.actions;
export default reportSlice.reducer;
