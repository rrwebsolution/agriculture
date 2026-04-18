// Dashboard no longer needs its own slice.
// It reads directly from: farmer, fisherfolk, crop, harvest, fishery, expenses slices.
// This file is kept as a re-export shim so the store registration stays valid.
import { createSlice } from '@reduxjs/toolkit';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {},
  reducers: {},
});

export default dashboardSlice.reducer;
