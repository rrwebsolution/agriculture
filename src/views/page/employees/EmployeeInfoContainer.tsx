import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Building2, GitBranch, Mail, Phone, Plus, RefreshCw, Search, Trash2, UserRoundCog, Users, X, Save, Loader2, LayoutGrid, User, Contact, ShieldCheck, Camera, ImagePlus } from 'lucide-react';
import axios from '../../../plugin/axios';
import { cn } from '../../../lib/utils';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deleteEmployeeRecord, setEmployeeData, setEmployeeLoading, upsertEmployeeRecord } from '../../../store/slices/employeeSlice';
import { removeTechnicianEmployee, upsertTechnicianEmployee } from '../../../store/slices/technicianLogSlice';
import { setRoleData } from '../../../store/slices/roleSlice';
import { setClusterData } from '../../../store/slices/clusterSlice';

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
  employment_type: 'Regular',
  status: 'Active',
  supervisor_id: '',
  work_location: '',
  current_assignment: '',
  face_reference_image: '',
};

const generateEmployeeNumber = () => `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

export default function EmployeeInfoContainer() {
  const dispatch = useAppDispatch();
  const { records: employees, orgChart, isLoaded, isLoading } = useAppSelector((state: any) => state.employees);
  const { records: roles, isLoaded: rolesLoaded } = useAppSelector((state: any) => state.role);
  const { records: clusters, isLoaded: clustersLoaded } = useAppSelector((state: any) => state.cluster);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [form, setForm] = useState(defaultEmployee);

  const fetchData = async (forceRefresh = false) => {
    if (isLoaded && !forceRefresh) return;
    dispatch(setEmployeeLoading(true));
    try {
      const requests: Promise<any>[] = [
        axios.get('employees'),
        axios.get('employees/org-chart'),
      ];

      if (!rolesLoaded || forceRefresh) requests.push(axios.get('roles'));
      if (!clustersLoaded || forceRefresh) requests.push(axios.get('clusters'));

      const responses = await Promise.all(requests);
      const [employeeRes, orgRes, rolesRes, clustersRes] = responses;

      dispatch(setEmployeeData({
        records: employeeRes.data.data || [],
        orgChart: orgRes.data.data || [],
      }));
      if (rolesRes) dispatch(setRoleData({ records: rolesRes.data.data || [] }));
      if (clustersRes) dispatch(setClusterData({ records: clustersRes.data.data || [] }));
    } catch {
      dispatch(setEmployeeLoading(false));
      toast.error('Failed to load employee records.');
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  const filteredEmployees = useMemo(() => {
    const needle = search.toLowerCase();
    return employees.filter((employee: any) =>
      [
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

  const openCreate = () => {
    setEditingEmployee(null);
    setForm({
      ...defaultEmployee,
      employee_no: generateEmployeeNumber(),
    });
    setIsModalOpen(true);
  };

  const openEdit = (employee: any) => {
    setEditingEmployee(employee);
    setForm({
      ...defaultEmployee,
      ...employee,
      supervisor_id: employee.supervisor_id?.toString() || '',
      employee_no: employee.employee_no || generateEmployeeNumber(),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        employee_no: form.employee_no || generateEmployeeNumber(),
        division: '',
        supervisor_id: form.supervisor_id || null,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <BriefcaseBusiness size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Human Resources</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Employee <span className="text-primary italic">Information</span>
          </h2>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 cursor-pointer">
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard isLoading={isLoading} icon={<Users />} label="Employees" value={employees.length} tone="blue" />
        <MetricCard isLoading={isLoading} icon={<Building2 />} label="Departments" value={new Set(employees.map((e: any) => e.department).filter(Boolean)).size} tone="emerald" />
        <MetricCard isLoading={isLoading} icon={<GitBranch />} label="Org Roots" value={orgChart.length} tone="amber" />
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee, position, or department..." className="w-full h-13 pl-12 pr-12 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary" />
          {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 cursor-pointer"><X size={14} /></button>}
        </div>
        <button onClick={() => fetchData(true)} disabled={isLoading} className="w-full md:w-auto px-6 h-13 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase flex items-center justify-center gap-2 cursor-pointer">
          <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading && <ProgressLoader />}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">Employee Directory</h3>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
            <table className="w-full min-w-245 text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Position/Role</th>
                  <th className="px-6 py-4">Department/Cluster</th>
                  <th className="px-6 py-4">Work Location</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {isLoading ? Array.from({ length: 5 }).map((_, index) => (
                  <EmployeeTableRowSkeleton key={index} />
                )) : filteredEmployees.map((employee: any) => (
                  <tr key={employee.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase text-gray-800 dark:text-white">{employee.first_name} {employee.last_name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{employee.employee_no}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-gray-600 dark:text-slate-300">{employee.position || 'No role assigned'}</td>
                    <td className="px-6 py-5 text-[11px] font-bold text-gray-600 dark:text-slate-300">{employee.department || 'Unassigned'}</td>
                    <td className="px-6 py-5 text-[11px] font-bold text-gray-600 dark:text-slate-300">{employee.work_location || 'Unassigned'}</td>
                    <td className="px-6 py-5">
                      <div className="space-y-1 text-[11px] font-bold text-gray-600 dark:text-slate-300">
                        <p className="flex items-center gap-2"><Mail size={13} className="text-gray-400" /> {employee.email || 'No email'}</p>
                        <p className="flex items-center gap-2"><Phone size={13} className="text-gray-400" /> {employee.contact_no || 'No contact'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn('inline-flex px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', employee.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : employee.status === 'On Leave' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(employee)} className="p-3 rounded-xl bg-primary/10 text-primary cursor-pointer">
                          <UserRoundCog size={16} />
                        </button>
                        <button onClick={() => handleDelete(employee)} className="p-3 rounded-xl bg-rose-50 text-rose-500 cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">No employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading && <ProgressLoader />}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">Organizational Structure</h3>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => <OrgNodeSkeleton key={index} depth={index % 3} />)}
              </div>
            ) : orgChart.length > 0 ? orgChart.map((node: any) => <OrgNode key={node.id} node={node} depth={0} />) : (
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">No hierarchy available yet.</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : () => setIsModalOpen(false)} />

          <form onSubmit={handleSave} className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-white">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Plus size={20} /></div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight leading-none">{editingEmployee ? 'Update Employee' : 'Add Employee'}</h2>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Employee Directory</p>
                </div>
              </div>
              <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>

            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <LayoutGrid size={14} />
                  <span className="text-[11px] font-black uppercase tracking-widest">1. Basic Information</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StyledInput icon={<User size={16} />} label="Employee No." required disabled placeholder="Auto-generated employee number" value={form.employee_no} onChange={() => {}} />
                  <StyledSelect
                    label="Position/Role"
                    required
                    value={form.position}
                    onChange={(value) => setForm((prev) => ({ ...prev, position: value }))}
                    options={[
                      { value: '', label: 'Select role' },
                      ...roles.map((role: any) => ({ value: role.name, label: role.name })),
                    ]}
                  />
                  <StyledInput label="First Name" required placeholder="e.g. Juan" value={form.first_name} onChange={(value) => setForm((prev) => ({ ...prev, first_name: value }))} />
                  <StyledInput label="Middle Name" placeholder="e.g. Dela Cruz" value={form.middle_name} onChange={(value) => setForm((prev) => ({ ...prev, middle_name: value }))} />
                  <StyledInput label="Last Name" required placeholder="e.g. Santos" value={form.last_name} onChange={(value) => setForm((prev) => ({ ...prev, last_name: value }))} />
                  <StyledInput label="Suffix" placeholder="e.g. Jr., Sr., III (Optional)" value={form.suffix} onChange={(value) => setForm((prev) => ({ ...prev, suffix: value }))} />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <Contact size={14} />
                  <span className="text-[11px] font-black uppercase tracking-widest">2. Contact & Assignment</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StyledInput icon={<Mail size={16} />} label="Email" placeholder="e.g. juan.santos@email.com" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
                  <StyledInput icon={<Phone size={16} />} label="Contact No." placeholder="e.g. 09123456789" value={form.contact_no} onChange={(value) => setForm((prev) => ({ ...prev, contact_no: value }))} />
                  <StyledSelect
                    label="Department/Cluster"
                    required
                    value={form.department}
                    onChange={(value) => setForm((prev) => ({ ...prev, department: value }))}
                    options={[
                      { value: '', label: 'Select cluster' },
                      ...clusters.map((cluster: any) => ({ value: cluster.name, label: cluster.name })),
                    ]}
                  />
                  <StyledSelect
                    label="Work Location"
                    required
                    value={form.work_location}
                    onChange={(value) => setForm((prev) => ({ ...prev, work_location: value }))}
                    options={[
                      { value: '', label: 'Select work location' },
                      ...clusters.map((cluster: any) => ({ value: cluster.name, label: cluster.name })),
                    ]}
                  />
                  <StyledInput icon={<BriefcaseBusiness size={16} />} label="Current Assignment" placeholder="e.g. Brgy. San Jose Monitoring" value={form.current_assignment} onChange={(value) => setForm((prev) => ({ ...prev, current_assignment: value }))} />
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Camera size={12} className="text-primary" />
                      Face Reference Image
                    </label>
                    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-4 space-y-4">
                      <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/30 bg-white dark:bg-slate-900 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-primary cursor-pointer hover:bg-primary/5 transition-colors">
                        <ImagePlus size={16} />
                        Upload Reference Face
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
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {form.face_reference_image && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3">
                          <div className="flex items-center gap-3">
                            <img src={form.face_reference_image} alt="Face reference" className="h-20 w-20 rounded-2xl object-cover border border-gray-200 dark:border-slate-700" />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Reference Ready</p>
                              <p className="text-[11px] font-bold text-gray-500">This image will be used for technician face verification.</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setForm((prev: any) => ({ ...prev, face_reference_image: '' }))} className="px-4 py-3 rounded-2xl bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck size={14} />
                  <span className="text-[11px] font-black uppercase tracking-widest">3. Employment Setup</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StyledInput label="Employment Type" required placeholder="e.g. Regular, Contractual, Job Order" value={form.employment_type} onChange={(value) => setForm((prev) => ({ ...prev, employment_type: value }))} />
                  <StyledSelect label="Status" required value={form.status} onChange={(value) => setForm((prev) => ({ ...prev, status: value }))} options={['Active', 'Inactive', 'On Leave']} />
                  <div className="md:col-span-2">
                    <StyledSelect
                      label="Supervisor"
                      value={form.supervisor_id}
                      onChange={(value) => setForm((prev) => ({ ...prev, supervisor_id: value }))}
                      options={[
                        { value: '', label: 'No supervisor' },
                        ...employees
                          .filter((employee: any) => employee.id !== editingEmployee?.id)
                          .map((employee: any) => ({
                            value: employee.id.toString(),
                            label: `${employee.first_name} ${employee.last_name} - ${employee.position}`,
                          })),
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSaving} className={cn('px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95', isSaving && 'opacity-50 cursor-not-allowed')}>
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, tone, isLoading }: any) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 min-h-28 overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}
      {isLoading ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
            <div className="h-7 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
          </div>
        </>
      ) : (
        <>
          <div className={cn('p-4 rounded-2xl', tones[tone] || tones.blue)}>{icon}</div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{value}</p>
          </div>
        </>
      )}
    </div>
  );
}

function ProgressLoader() {
  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
      <div className="h-full bg-primary w-[40%] animate-progress-loop" />
    </div>
  );
}

function EmployeeTableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-5"><div className="space-y-2"><div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" /><div className="h-3 w-28 bg-gray-200 dark:bg-slate-800 rounded" /></div></td>
      <td className="px-6 py-5"><div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded" /></td>
      <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" /></td>
      <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" /></td>
      <td className="px-6 py-5"><div className="space-y-2"><div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" /><div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded" /></div></td>
      <td className="px-6 py-5 text-center"><div className="inline-block h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-xl" /></td>
      <td className="px-6 py-5"><div className="flex items-center justify-end gap-2"><div className="h-11 w-11 bg-gray-200 dark:bg-slate-800 rounded-xl" /><div className="h-11 w-11 bg-gray-200 dark:bg-slate-800 rounded-xl" /></div></td>
    </tr>
  );
}

function OrgNodeSkeleton({ depth }: { depth: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 animate-pulse" style={{ marginLeft: depth * 18 }}>
      <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
      <div className="h-3 w-28 bg-gray-200 dark:bg-slate-800 rounded mt-2" />
      <div className="h-3 w-36 bg-gray-200 dark:bg-slate-800 rounded mt-3" />
    </div>
  );
}

function OrgNode({ node, depth }: { node: any; depth: number }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4" style={{ marginLeft: depth * 18 }}>
        <p className="text-sm font-black uppercase text-gray-800 dark:text-white">{node.first_name || node.name} {node.last_name || ''}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">{node.position}</p>
        <p className="text-[11px] font-bold text-gray-500 mt-2">{node.department}{node.division ? ` / ${node.division}` : ''}</p>
      </div>
      {node.children?.length > 0 && (
        <div className="space-y-3">
          {node.children.map((child: any) => <OrgNode key={child.id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

function StyledInput({ label, value, onChange, icon, placeholder, required, disabled }: { label: string; value: string; onChange: (value: string) => void; icon?: React.ReactNode; placeholder?: string; required?: boolean; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4 text-gray-400">{icon}</div>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none placeholder:text-gray-300 dark:placeholder:text-slate-600 disabled:opacity-70 disabled:cursor-not-allowed',
            icon ? 'pl-11 pr-4' : 'px-4'
          )}
        />
      </div>
    </div>
  );
}

function StyledSelect({ label, value, onChange, options, required }: { label: string; value: string; onChange: (value: string) => void; options: Array<string | { value: string; label: string }>; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
        {options.map((option) => {
          if (typeof option === 'string') return <option key={option} value={option}>{option}</option>;
          return <option key={option.value} value={option.value}>{option.label}</option>;
        })}
      </select>
    </div>
  );
}
