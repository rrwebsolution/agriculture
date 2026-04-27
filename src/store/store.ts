import { configureStore, combineReducers } from '@reduxjs/toolkit';
import fisherfolkReducer from './slices/fisherfolkSlice';
import farmerReducer from './slices/farmerSlice';
import cooperativeReducer from './slices/cooperativeSlice';
import barangayReducer from './slices/barangaySlice';
import clusterReducer from './slices/clusterSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import cropReducer from './slices/cropSlice';
import plantingReducer from './slices/plantingSlice';
import harvestReducer from './slices/harvestSlice';
import fisheryReducer from './slices/fisherySlice';
import equipmentReducer from './slices/equipmentSlice';
import inventoryReducer from './slices/inventorySlice';
import expensesReducer from './slices/expenseSlice';
import reportReducer from './slices/reportSlice';
import dashboardReducer from './slices/dashboardSlice';
import technicianLogReducer from './slices/technicianLogSlice';
import employeeReducer from './slices/employeeSlice';
import dangerZoneReducer from './slices/dangerZoneSlice';

// 1. I-combine ang tanang reducers (para sa type safety)
const rootReducer = combineReducers({
  fisherfolk: fisherfolkReducer,
  farmer: farmerReducer,
  cooperative: cooperativeReducer,
  barangay: barangayReducer,
  cluster: clusterReducer,
  user: userReducer,
  role: roleReducer,
  crop: cropReducer,
  planting: plantingReducer,
  harvest: harvestReducer,
  fishery: fisheryReducer,
  equipment: equipmentReducer,
  inventory: inventoryReducer,
  expenses: expensesReducer,
  reports: reportReducer,
  dashboard: dashboardReducer,
  technicianLogs: technicianLogReducer,
  employees: employeeReducer,
  dangerZones: dangerZoneReducer,
});

// Remove legacy persisted state so it stops eating localStorage space
localStorage.removeItem('appState');

// 2. I-configure ang store (in-memory lang, dili i-persist sa localStorage)
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
