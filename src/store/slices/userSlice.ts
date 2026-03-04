import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  records: any[];
  roles: any[];
  clusters: any[];
  isLoaded: boolean;
}

const initialState: UserState = {
  records: [],
  roles: [],
  clusters: [],
  isLoaded: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 🌟 INITIAL LOAD OF USERS, ROLES AND CLUSTERS
    setUserData: (state, action: PayloadAction<{ records: any[]; roles: any[]; clusters: any[] }>) => {
      state.records = action.payload.records;
      state.roles = action.payload.roles;
      state.clusters = action.payload.clusters;
      state.isLoaded = true;
    },

    // 🌟 ADD OR EDIT USER RECORD
    updateUserRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        state.records.unshift(data);
      } else {
        const index = state.records.findIndex((u) => u.id === data.id);
        if (index !== -1) {
          state.records[index] = data;
        }
      }
    },

    // 🌟 DELETE USER RECORD
    deleteUserRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((u) => u.id !== action.payload);
    },
  },
});

export const { setUserData, updateUserRecord, deleteUserRecord } = userSlice.actions;
export default userSlice.reducer;