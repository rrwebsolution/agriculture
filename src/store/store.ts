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

const PERSISTED_STATE_KEY = 'appState';

// 🌟 Tanang slices kay refetch-on-mount man gikan sa API (tan-awa ang mga
// Container components), so walay benefit ang pag-cache sa entire tree sa
// localStorage — hinuon mao ni ang naka-hit sa QuotaExceededError kay
// nag-JSON.stringify sa tibuok state (records, reports, dashboard stats, etc.)
// matag dispatch. I-clear na lang ang naa nang napristed gikan sa daan nga bersyon.
try {
  localStorage.removeItem(PERSISTED_STATE_KEY);
} catch {
  // ignore
}

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

// 2. I-configure ang store (walay localStorage persistence — see note above)
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
