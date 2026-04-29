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

const loadPersistedState = () => {
  try {
    const serializedState = localStorage.getItem(PERSISTED_STATE_KEY);
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    console.warn('Failed to load persisted redux state:', error);
    return undefined;
  }
};

const savePersistedState = (state: unknown) => {
  try {
    localStorage.setItem(PERSISTED_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to persist redux state:', error);
  }
};

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

const preloadedState = loadPersistedState();

// 2. I-configure ang store with persisted state
export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

store.subscribe(() => {
  savePersistedState(store.getState());
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
