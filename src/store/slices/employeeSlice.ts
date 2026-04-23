import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface EmployeeState {
  records: any[];
  orgChart: any[];
  isLoaded: boolean;
  isLoading: boolean;
}

const mapEmployeesById = (records: any[]) =>
  new Map(records.map((employee) => [String(employee.id), { ...employee, children: [] as any[] }]));

const buildOrgChart = (records: any[]) => {
  const employeeMap = mapEmployeesById(records);
  const roots: any[] = [];

  employeeMap.forEach((employee) => {
    const supervisorId = employee.supervisor_id != null ? String(employee.supervisor_id) : '';
    const supervisor = supervisorId ? employeeMap.get(supervisorId) : null;

    if (supervisor && supervisor.id !== employee.id) {
      supervisor.children.push(employee);
      return;
    }

    roots.push(employee);
  });

  const sortNodes = (nodes: any[]) => {
    nodes.sort((a, b) => {
      const aName = `${a.last_name || ''} ${a.first_name || ''}`.trim();
      const bName = `${b.last_name || ''} ${b.first_name || ''}`.trim();
      return aName.localeCompare(bName);
    });

    nodes.forEach((node) => sortNodes(node.children || []));
    return nodes;
  };

  return sortNodes(roots);
};

const initialState: EmployeeState = {
  records: [],
  orgChart: [],
  isLoaded: false,
  isLoading: false,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployeeLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setEmployeeData: (state, action: PayloadAction<{ records: any[]; orgChart: any[] }>) => {
      state.records = action.payload.records;
      state.orgChart = action.payload.orgChart?.length ? action.payload.orgChart : buildOrgChart(action.payload.records);
      state.isLoaded = true;
      state.isLoading = false;
    },
    upsertEmployeeRecord: (state, action: PayloadAction<{ data: any; mode: 'add' | 'edit' }>) => {
      const { data, mode } = action.payload;
      if (mode === 'add') {
        const exists = state.records.find((employee) => employee.id === data.id);
        if (!exists) state.records.unshift(data);
      } else {
        const index = state.records.findIndex((employee) => employee.id === data.id);
        if (index !== -1) state.records[index] = data;
        else state.records.unshift(data);
      }
      state.orgChart = buildOrgChart(state.records);
    },
    deleteEmployeeRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter((employee) => employee.id !== action.payload);
      state.orgChart = buildOrgChart(state.records);
    },
    setEmployeeOrgChart: (state, action: PayloadAction<any[]>) => {
      state.orgChart = action.payload;
    },
    resetEmployeeState: () => initialState,
  },
});

export const {
  setEmployeeLoading,
  setEmployeeData,
  upsertEmployeeRecord,
  deleteEmployeeRecord,
  setEmployeeOrgChart,
  resetEmployeeState,
} = employeeSlice.actions;

export default employeeSlice.reducer;
