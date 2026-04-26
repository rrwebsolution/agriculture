import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Building2, GitBranch, Mail, Phone, Plus, RefreshCw, Search, Trash2, UserRoundCog, Users, X, Save, Loader2, LayoutGrid, User, Contact, ShieldCheck, Camera, ImagePlus, ChevronsUpDown, Check, ChevronDown, ChevronRight } from 'lucide-react';
import axios from '../../../plugin/axios';
import { cn } from '../../../lib/utils';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deleteEmployeeRecord, setEmployeeData, setEmployeeLoading, upsertEmployeeRecord } from '../../../store/slices/employeeSlice';
import { removeTechnicianEmployee, upsertTechnicianEmployee } from '../../../store/slices/technicianLogSlice';
import { setRoleData } from '../../../store/slices/roleSlice';
import { setClusterData } from '../../../store/slices/clusterSlice';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';

const defaultEmployee = {
  employee_no: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  email: '',
  contact_no: '',
  position: '',
  department: '',
  division: '',
  employment_type: 'Job Order',
  status: 'Active',
  supervisor_id: '',
  work_location: '',
  current_assignment: '',
  face_reference_image: '',
};

const generateEmployeeNumber = () => `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

// Helper to get initials
const getInitials = (first: string, last: string) => {
  return `${(first || 'U').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();
};

const isActiveOrNoStatus = (record: any) => {
  const status = String(record?.status ?? '').trim().toLowerCase();
  return !status || status === 'active';
};

export default function EmployeeInfoContainer() {
  const dispatch = useAppDispatch();
  const { records: employees, orgChart, isLoaded, isLoading } = useAppSelector((state: any) => state.employees);
  const { records: roles, isLoaded: rolesLoaded } = useAppSelector((state: any) => state.role);
  const { records: clusters, isLoaded: clustersLoaded } = useAppSelector((state: any) => state.cluster);
  const[search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isSaving, setIsSaving] = useState(false);
  const[isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [form, setForm] = useState(defaultEmployee);
  const[formErrors, setFormErrors] = useState<Record<string, string>>({});
  const[storedFaceReferenceImage, setStoredFaceReferenceImage] = useState('');
  const[isFaceReferenceChanged, setIsFaceReferenceChanged] = useState(false);

  const setFieldValue = (field: keyof typeof defaultEmployee, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const requiredFields: Array<{ key: keyof typeof defaultEmployee; label: string }> =[
      { key: 'employee_no', label: 'Employee No.' },
      { key: 'position', label: 'Position/Role' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'department', label: 'Department/Cluster' },
      { key: 'work_location', label: 'Work Location' },
      { key: 'employment_type', label: 'Employment Type' },
      { key: 'status', label: 'Status' },
    ];

    requiredFields.forEach(({ key, label }) => {
      if (!String(form[key] ?? '').trim()) nextErrors[key] = `${label} is required.`;
    });

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fetchData = async (forceRefresh = false) => {
    if (isLoaded && !forceRefresh) return;
    dispatch(setEmployeeLoading(true));
    try {
      const requests: Promise<any>[] =[
        axios.get('employees'),
        axios.get('employees/org-chart'),
      ];

      if (!rolesLoaded || forceRefresh) requests.push(axios.get('roles'));
      if (!clustersLoaded || forceRefresh) requests.push(axios.get('clusters'));

      const responses = await Promise.all(requests);
      const[employeeRes, orgRes, rolesRes, clustersRes] = responses;

      dispatch(setEmployeeData({
        records: employeeRes.data.data || [],
        orgChart: orgRes.data.data ||[],
      }));
      if (rolesRes) dispatch(setRoleData({ records: rolesRes.data.data ||[] }));
      if (clustersRes) dispatch(setClusterData({ records: clustersRes.data.data ||[] }));
    } catch {
      dispatch(setEmployeeLoading(false));
      toast.error('Failed to load employee records.');
    }
  };

  useEffect(() => {
    fetchData(false);
  },[]);

  const filteredEmployees = useMemo(() => {
    const needle = search.toLowerCase();
    return employees.filter((employee: any) =>[
        employee.employee_no,
        employee.first_name,
        employee.middle_name,
        employee.last_name,
        employee.position,
        employee.department,
        employee.work_location,
      ].join(' ').toLowerCase().includes(needle)
    );
  }, [employees, search]);

  const activeRoles = useMemo(
    () => roles.filter((role: any) => isActiveOrNoStatus(role)),
    [roles]
  );

  const activeClusters = useMemo(
    () => clusters.filter((cluster: any) => isActiveOrNoStatus(cluster)),
    [clusters]
  );

  const activeSupervisorOptions = useMemo(
    () => employees.filter((employee: any) => employee.id !== editingEmployee?.id && isActiveOrNoStatus(employee)),
    [employees, editingEmployee]
  );

  useEffect(() => { setCurrentPage(1); },[search]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => {
    setEditingEmployee(null);
    setFormErrors({});
    setStoredFaceReferenceImage('');
    setIsFaceReferenceChanged(false);
    setForm({
      ...defaultEmployee,
      employee_no: generateEmployeeNumber(),
    });
    setIsModalOpen(true);
  };

  const openEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormErrors({});
    setStoredFaceReferenceImage(employee.face_reference_image || '');
    setIsFaceReferenceChanged(false);
    setForm({
      ...defaultEmployee,
      ...employee,
      face_reference_image: '',
      supervisor_id: employee.supervisor_id?.toString() || '',
      employee_no: employee.employee_no || generateEmployeeNumber(),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please complete all required fields.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        employee_no: form.employee_no || generateEmployeeNumber(),
        division: '',
        supervisor_id: form.supervisor_id || null,
        face_reference_image: editingEmployee
          ? (isFaceReferenceChanged ? form.face_reference_image : storedFaceReferenceImage)
          : form.face_reference_image,
      };

      let savedEmployee;
      if (editingEmployee) {
        const response = await axios.put(`employees/${editingEmployee.id}`, payload);
        savedEmployee = response.data.data;
        dispatch(upsertEmployeeRecord({ data: savedEmployee, mode: 'edit' }));
      } else {
        const response = await axios.post('employees', payload);
        savedEmployee = response.data.data;
        dispatch(upsertEmployeeRecord({ data: savedEmployee, mode: 'add' }));
      }

      dispatch(upsertTechnicianEmployee(savedEmployee));
      setStoredFaceReferenceImage(savedEmployee?.face_reference_image || '');
      setIsFaceReferenceChanged(false);
      toast.success(editingEmployee ? 'Employee updated.' : 'Employee added.');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save employee.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (employee: any) => {
    const result = await Swal.fire({
      title: 'Delete employee?',
      text: `${employee.first_name} ${employee.last_name} will be removed from the directory.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-3',
        cancelButton: 'rounded-xl px-6 py-3',
      }
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`employees/${employee.id}`);
      dispatch(deleteEmployeeRecord(employee.id));
      dispatch(removeTechnicianEmployee(employee.id));
      toast.success('Employee deleted.');
    } catch {
      toast.error('Failed to delete employee.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BriefcaseBusiness size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Human Resources</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight leading-none">
            Employee <span className="text-primary italic">Information</span>
          </h2>
        </div>
        <button 
          onClick={openCreate} 
          className="group flex items-center gap-2 bg-linear-to-r from-primary to-primary/80 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="p-1 rounded-full bg-white/20 group-hover:rotate-90 transition-transform duration-300">
            <Plus size={14} />
          </div>
          Add Employee
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard isLoading={isLoading} icon={<Users size={24} />} label="Total Employees" value={employees.length} tone="blue" />
        <MetricCard isLoading={isLoading} icon={<Building2 size={24} />} label="Active Departments" value={new Set(employees.map((e: any) => e.department).filter(Boolean)).size} tone="emerald" />
        <MetricCard isLoading={isLoading} icon={<GitBranch size={24} />} label="Org Roots" value={orgChart.length} tone="amber" />
      </div>

      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-md dark:bg-slate-900/80 p-3 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by name, position, or department..." 
            className="w-full h-14 pl-12 pr-12 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all duration-300" 
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-rose-50 hover:text-rose-500 text-gray-400 transition-colors cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>
        <button 
          onClick={() => fetchData(true)} 
          disabled={isLoading} 
          className="w-full md:w-auto px-6 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:text-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Organizational Structure - Takes 4 columns on large screens */}
        <div className="lg:col-span-4 relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-200">
          {isLoading && <ProgressLoader />}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 shrink-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white flex items-center gap-2">
              <GitBranch size={16} className="text-primary" />
              Hierarchy Tree
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Organizational Structure</p>
          </div>
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-slate-900/50">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => <OrgNodeSkeleton key={index} depth={index % 3} />)}
              </div>
            ) : orgChart.length > 0 ? (
              <div className="pb-4">
                {orgChart.map((node: any, idx: number) => (
                  <OrgNode key={node.id} node={node} depth={0} isLast={idx === orgChart.length - 1} />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                <GitBranch size={48} className="text-gray-300" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">No hierarchy available</p>
              </div>
            )}
          </div>
        </div>

        {/* Employee Directory - Takes 8 columns on large screens */}
        <div className="lg:col-span-8 relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-200">
          {isLoading && <ProgressLoader />}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 shrink-0 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Directory List
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Manage personnel records</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <table className="w-full min-w-200 text-left border-collapse">
              <thead className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800 z-10">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role & Dept</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {isLoading ? Array.from({ length: 6 }).map((_, index) => (
                  <EmployeeTableRowSkeleton key={index} />
                )) : paginatedEmployees.map((employee: any) => (
                  <tr key={employee.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                          {getInitials(employee.first_name, employee.last_name)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {employee.employee_no}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-gray-600 dark:text-slate-300">
                          {employee.position || 'No role'}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <Building2 size={12} />
                          <span className="truncate max-w-37.5">{employee.department || 'Unassigned'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 text-[11px] font-medium text-gray-500 dark:text-slate-400">
                        <p className="flex items-center gap-2">
                          <Mail size={12} className="text-gray-400" /> 
                          {employee.email || <span className="italic opacity-50">No email</span>}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone size={12} className="text-gray-400" /> 
                          {employee.contact_no || <span className="italic opacity-50">No contact</span>}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border', 
                        employee.status === 'Active' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 
                        employee.status === 'On Leave' ? 'bg-amber-50/50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20' : 
                        'bg-rose-50/50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20'
                      )}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(employee)} className="p-2.5 rounded-xl bg-gray-50 hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Edit">
                          <UserRoundCog size={16} />
                        </button>
                        <button onClick={() => handleDelete(employee)} className="p-2.5 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                        <Search size={40} className="text-gray-300" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">No employees found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {!isLoading && filteredEmployees.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Showing{' '}
                <span className="text-gray-700 dark:text-slate-300 font-black">
                  {(currentPage - 1) * pageSize + 1}
                </span>
                {' '}to{' '}
                <span className="text-gray-700 dark:text-slate-300 font-black">
                  {Math.min(currentPage * pageSize, filteredEmployees.length)}
                </span>
                {' '}of{' '}
                <span className="text-primary font-black">{filteredEmployees.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : () => setIsModalOpen(false)} />

          <form onSubmit={handleSave} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div className="bg-linear-to-r from-primary to-primary/80 p-6 sm:p-8 flex items-center justify-between shrink-0 relative overflow-hidden">
              {/* Abstract decoration */}
              <div className="absolute top-[-50%] right-[-10%] w-75 h-75 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-5 relative z-10 text-white">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  {editingEmployee ? <UserRoundCog size={24} /> : <Plus size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight leading-none">
                    {editingEmployee ? 'Update Employee' : 'New Employee'}
                  </h2>
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-[0.2em] mt-1.5">
                    Personnel Directory Form
                  </p>
                </div>
              </div>
              <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="relative z-10 p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white cursor-pointer transition-all disabled:opacity-50 backdrop-blur-md">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
              {/* Section 1 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary"><LayoutGrid size={16} /></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <StyledInput icon={<User size={16} />} label="Employee No." required disabled placeholder="Auto-generated employee number" value={form.employee_no} onChange={() => {}} error={formErrors.employee_no} />
                  <StyledSelect
                    label="Position/Role"
                    required
                    value={form.position}
                    onChange={(value) => setFieldValue('position', value)}
                    options={[
                      { value: '', label: 'Select role' },
                      ...activeRoles.map((role: any) => ({ value: role.name, label: role.name })),
                    ]}
                    error={formErrors.position}
                  />
                  <StyledInput label="First Name" required placeholder="e.g. Juan" value={form.first_name} onChange={(value) => setFieldValue('first_name', value)} error={formErrors.first_name} />
                  <StyledInput label="Middle Name" placeholder="e.g. Dela Cruz" value={form.middle_name} onChange={(value) => setFieldValue('middle_name', value)} />
                  <StyledInput label="Last Name" required placeholder="e.g. Santos" value={form.last_name} onChange={(value) => setFieldValue('last_name', value)} error={formErrors.last_name} />
                  <StyledInput label="Suffix" placeholder="e.g. Jr., Sr. (Optional)" value={form.suffix} onChange={(value) => setFieldValue('suffix', value)} />
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary"><Contact size={16} /></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white">Contact & Assignment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <StyledInput icon={<Mail size={16} />} label="Email" placeholder="e.g. juan.santos@email.com" value={form.email} onChange={(value) => setFieldValue('email', value)} />
                  <StyledInput icon={<Phone size={16} />} label="Contact No." placeholder="e.g. 09123456789" value={form.contact_no} onChange={(value) => setFieldValue('contact_no', value)} />
                  <StyledSelect
                    label="Department/Cluster"
                    required
                    value={form.department}
                    onChange={(value) => setFieldValue('department', value)}
                    options={[
                      { value: '', label: 'Select cluster' },
                      ...activeClusters.map((cluster: any) => ({ value: cluster.name, label: cluster.name })),
                    ]}
                    error={formErrors.department}
                  />
                  <StyledSelect
                    label="Work Location"
                    required
                    value={form.work_location}
                    onChange={(value) => setFieldValue('work_location', value)}
                    options={[
                      { value: '', label: 'Select work location' },
                      ...activeClusters.map((cluster: any) => ({ value: cluster.name, label: cluster.name })),
                    ]}
                    error={formErrors.work_location}
                  />
                  <div className="md:col-span-2">
                    <StyledInput icon={<BriefcaseBusiness size={16} />} label="Current Assignment" placeholder="e.g. Brgy. San Jose Monitoring" value={form.current_assignment} onChange={(value) => setFieldValue('current_assignment', value)} />
                  </div>
                  
                  <div className="md:col-span-2 space-y-3 bg-gray-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Camera size={14} className="text-primary" />
                      Biometric Face Reference
                    </label>
                    <div className="space-y-4">
                      <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-white/50 dark:bg-slate-900/50 px-6 py-8 text-[11px] font-black uppercase tracking-widest text-primary cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all">
                        <div className="p-3 rounded-full bg-primary/10">
                          <ImagePlus size={24} />
                        </div>
                        <span className="mt-1">Upload Reference Face</span>
                        <span className="text-[9px] text-gray-400 font-bold normal-case text-center max-w-xs">Supported formats: JPG, PNG. Image will be processed securely.</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              setForm((prev: any) => ({ ...prev, face_reference_image: String(reader.result || '') }));
                              setIsFaceReferenceChanged(true);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      
                      {editingEmployee && storedFaceReferenceImage && !form.face_reference_image && (
                        <div className="flex gap-4 items-start rounded-2xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 px-5 py-4">
                          <ShieldCheck size={20} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500">Privacy Mode Enabled</p>
                            <p className="text-[11px] font-medium text-amber-700/80 dark:text-amber-400 mt-1 leading-relaxed">A face reference image is securely stored but hidden to protect privacy. Upload a new image to overwrite.</p>
                          </div>
                        </div>
                      )}
                      
                      {form.face_reference_image && (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0">
                              <img src={form.face_reference_image} alt="Face reference" className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <Check size={14} /> Ready for use
                              </p>
                              <p className="text-[11px] font-medium text-gray-500 mt-1 max-w-xs">This image will be processed for facial verification. It will be hidden after saving.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev: any) => ({ ...prev, face_reference_image: '' }));
                              setIsFaceReferenceChanged(false);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary"><ShieldCheck size={16} /></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white">Employment Setup</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <StyledSelect
                    label="Employment Type"
                    required
                    value={form.employment_type}
                    onChange={(value) => setFieldValue('employment_type', value)}
                    options={['Regular', 'Contractual', 'Job Order', 'Casual', 'Part-time']}
                    placeholder="Select employment type"
                    error={formErrors.employment_type}
                  />
                  <StyledSelect 
                    label="Status" 
                    required 
                    value={form.status} 
                    onChange={(value) => setFieldValue('status', value)} 
                    options={['Active', 'Inactive', 'On Leave']} 
                    error={formErrors.status} 
                  />
                  <div className="md:col-span-2">
                    <StyledSelect
                      label="Direct Supervisor"
                      value={form.supervisor_id}
                      onChange={(value) => setFieldValue('supervisor_id', value)}
                    options={[
                      { value: '', label: 'None (Top Level)' },
                      ...activeSupervisorOptions.map((employee: any) => ({
                        value: employee.id.toString(),
                        label: `${employee.first_name} ${employee.last_name} — ${employee.position}`,
                      })),
                    ]}
                  />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className={cn('px-8 py-4 bg-linear-to-r from-primary to-primary/80 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all cursor-pointer shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0', isSaving && 'opacity-70 pointer-events-none')}>
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Processing...' : editingEmployee ? 'Save Changes' : 'Confirm & Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// --- Sub Components ---

function MetricCard({ icon, label, value, tone, isLoading }: any) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50/50 text-blue-600 border-blue-100/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
    emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
    amber: 'bg-amber-50/50 text-amber-600 border-amber-100/50 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  };

  return (
    <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 min-h-28 overflow-hidden group">
      {isLoading && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}
      {isLoading ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse shrink-0" />
          <div className="space-y-3 w-full">
            <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-24" />
            <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-16" />
          </div>
        </>
      ) : (
        <>
          <div className={cn('p-4 rounded-2xl border transition-transform group-hover:scale-110 duration-300', tones[tone] || tones.blue)}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <p className="text-3xl font-black text-gray-800 dark:text-white mt-1 leading-none">{value}</p>
          </div>
        </>
      )}
    </div>
  );
}

function ProgressLoader() {
  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
      <div className="h-full bg-primary w-[40%] animate-progress-loop rounded-full" />
    </div>
  );
}

function EmployeeTableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-100 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-2"><div className="h-3 w-32 bg-gray-100 dark:bg-slate-800 rounded" /><div className="h-2 w-20 bg-gray-100 dark:bg-slate-800 rounded" /></div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="space-y-2"><div className="h-4 w-24 bg-gray-100 dark:bg-slate-800 rounded-lg" /><div className="h-2 w-32 bg-gray-100 dark:bg-slate-800 rounded" /></div></td>
      <td className="px-6 py-4"><div className="space-y-2"><div className="h-3 w-40 bg-gray-100 dark:bg-slate-800 rounded" /><div className="h-3 w-28 bg-gray-100 dark:bg-slate-800 rounded" /></div></td>
      <td className="px-6 py-4 text-center"><div className="inline-block h-6 w-20 bg-gray-100 dark:bg-slate-800 rounded-full" /></td>
      <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><div className="h-9 w-9 bg-gray-100 dark:bg-slate-800 rounded-xl" /><div className="h-9 w-9 bg-gray-100 dark:bg-slate-800 rounded-xl" /></div></td>
    </tr>
  );
}

function OrgNodeSkeleton({ depth }: { depth: number }) {
  return (
    <div className="relative pt-2" style={{ paddingLeft: depth * 24 }}>
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-3 shadow-sm animate-pulse">
        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 bg-gray-100 dark:bg-slate-700 rounded" />
          <div className="h-2 w-20 bg-gray-100 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function OrgNode({ node, depth = 0, isLast = true }: { node: any; depth?: number; isLast?: boolean }) {
  // Expand first two levels by default
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative pt-3 pl-6">
      {/* Connector lines (Only show if it's not the absolute root) */}
      {depth > 0 && (
        <>
          {/* Horizontal line entering this node */}
          <div className="absolute top-8 left-0 w-6 h-px bg-gray-200 dark:bg-slate-700" />
          {/* Vertical line from parent. If it's the last child, it stops at top-8 */}
          <div className={cn("absolute left-0 w-px bg-gray-200 dark:bg-slate-700", isLast ? "top-0 h-8" : "top-0 h-full")} />
        </>
      )}

      {/* The Node Card itself */}
      <div className="relative z-10 flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/80 rounded-2xl p-2.5 pr-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group">
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-xs border border-primary/20 shrink-0">
          {getInitials(node.first_name, node.last_name)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate group-hover:text-primary transition-colors">
            {node.first_name} {node.last_name}
          </h4>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate mt-0.5">
            {node.position || 'Unassigned Role'}
          </p>
          {node.department && (
            <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1 mt-1 truncate">
              <Building2 size={10} className="shrink-0" /> {node.department}
            </p>
          )}
        </div>

        {hasChildren && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-primary hover:text-white text-gray-400 transition-colors shrink-0 cursor-pointer shadow-inner"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {/* Children nodes container */}
      {hasChildren && isExpanded && (
        <div className="relative mt-1">
          {node.children.map((child: any, idx: number) => (
            <OrgNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              isLast={idx === node.children.length - 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StyledInput({ label, value, onChange, icon, placeholder, required, disabled, error }: { label: string; value: string; onChange: (value: string) => void; icon?: React.ReactNode; placeholder?: string; required?: boolean; disabled?: boolean; error?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label} {required && <span className="text-rose-500">*</span>}</label>
      <div className="relative flex items-center group">
        {icon && <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors">{icon}</div>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            'w-full h-14 bg-gray-50/50 dark:bg-slate-800/50 border rounded-2xl text-sm font-medium outline-none placeholder:text-gray-300 dark:placeholder:text-slate-600 disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300',
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-gray-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-white dark:focus:bg-slate-900',
            icon ? 'pl-11 pr-4' : 'px-4'
          )}
        />
      </div>
      {error && <p className="text-[10px] font-black text-rose-500 ml-1 uppercase tracking-wide animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
}

function StyledSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const normalizedOptions = options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));
  const selectedLabel = normalizedOptions.find((option) => option.value === value)?.label;
  const displayLabel = selectedLabel || placeholder || normalizedOptions.find((option) => option.value === '')?.label || `Select ${label.toLowerCase()}`;

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              'w-full h-14 px-4 bg-gray-50/50 dark:bg-slate-800/50 border rounded-2xl text-sm font-medium outline-none flex items-center justify-between cursor-pointer disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300',
              error ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-gray-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-white dark:focus:bg-slate-900 data-[state=open]:border-primary/50 data-[state=open]:ring-4 data-[state=open]:ring-primary/10 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-900'
            )}
          >
            <span className={cn('truncate', !value && 'text-gray-400')}>{displayLabel}</span>
            <ChevronsUpDown size={16} className="text-gray-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-[320px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="border-none focus:ring-0 text-sm font-medium h-12" />
            <CommandList className="max-h-60 custom-scrollbar p-1.5">
              <CommandEmpty className="py-6 text-[11px] font-bold uppercase text-center text-gray-400 tracking-widest">No match found.</CommandEmpty>
              <CommandGroup className="space-y-1">
                {normalizedOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "text-xs font-bold py-3.5 px-4 rounded-xl cursor-pointer flex items-center justify-between ",
                      value === option.value ? "text-primary aria-selected:bg-primary/15" : "aria-selected:bg-gray-50 dark:aria-selected:bg-slate-800"
                    )}
                  >
                    <span className="tracking-wide whitespace-normal pr-3">{option.label}</span>
                    <Check size={14} className={cn('text-primary transition-opacity', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-[10px] font-black text-rose-500 ml-1 uppercase tracking-wide animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
}
