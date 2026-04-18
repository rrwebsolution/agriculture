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
});

// 2. Load state gikan sa localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('appState');
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// 3. I-configure ang store
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
 middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // I-disable ang immutable check kay dako ang imong data objects
      immutableCheck: false, 
      // Pwede sab i-disable ang serializable check kung naa kay komplikado nga data (optional)
      serializableCheck: false, 
    }),
});

// 4. Subscribe to save state
store.subscribe(() => {
  localStorage.setItem('appState', JSON.stringify(store.getState()));
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;