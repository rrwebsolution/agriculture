import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface RoleState {
  records: any[];
  isLoaded: boolean;
}

const initialState: RoleState = {
  records: [],
  isLoaded: false,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    // 🌟 INITIAL LOAD OF ROLES
    setRoleData: (state, action: PayloadAction<{ records: any[] }>) => {
      state.records = action.payload.records;
      state.isLoaded = true;
    },

    // 🌟 ADD OR EDIT ROLE RECORD
    updateRoleRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        state.records.unshift(data);
      } else {
        const index = state.records.findIndex((r) => r.id === data.id);
        if (index !== -1) {
          state.records[index] = data;
        }
      }
    },

    // 🌟 DELETE ROLE RECORD
    deleteRoleRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
  },
});

export const { setRoleData, updateRoleRecord, deleteRoleRecord } = roleSlice.actions;
export default roleSlice.reducer;