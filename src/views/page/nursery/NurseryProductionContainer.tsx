import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../../plugin/axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
  BarChart3, Calendar, CalendarDays, ClipboardList, Edit3,
  FileText, Loader2, Package, Plus, RefreshCw, Save, Search,
  Sprout, Trash2, X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getPageAccess } from '../../../lib/permissions';
import { useLocation } from 'react-router-dom';
import { CommandFilter } from '../../../components/ui/command-filter';

const ACTIVITIES = [
  'Collection of Scion',
  'Collection of Seed',
  'Collection of Seedlings',
  'Germination',
  'No. of Bagging',
  'No. of Seedlings Planted',
  'Garden Soil',
  'Disposal Seedlings',
];

const ACTIVITY_FILTER_OPTIONS = ['All Activities', ...ACTIVITIES];

const CROP_ITEMS = [
  'Grafted Lemonsito',
  'Grafted Suwa',
  'Jackfruit',
  'Mango Grafted',
  'Avocado',
  'Lanzones',
  'Mangosteen',
  'Labana',
  'Durian',
  'Pomelo/Seedling',
  'Macopa/Cacao',
  'Rambutan Grafted',
  'Garden Soil',
];

const UNITS = ['pcs', 'seedlings', 'seeds', 'scions', 'bags', 'cubics'];

const emptyForm = {
  record_date: new Date().toISOString().slice(0, 10),
  activity: '',
  crop_item: '',
  quantity: '',
  unit: 'pcs',
  nursery_site: '',
  remarks: '',
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function NurseryProductionContainer() {
  const location = useLocation();
  const { canManage } = getPageAccess(location.pathname);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('All Activities');
  const [formData, setFormData] = useState<any>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRecords = async (forceRefresh = false) => {
    if (!forceRefresh && records.length > 0) return;
    setIsLoading(true);
    try {
      const res = await axios.get('nursery-records');
      setRecords(res.data.data || []);
    } catch {
      toast.error('Failed to load nursery records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRecords(true); }, []);

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((record) => {
      const matchesSearch = [record.activity, record.crop_item, record.unit, record.nursery_site, record.remarks]
        .join(' ')
        .toLowerCase()
        .includes(q);
      const matchesActivity = activityFilter === 'All Activities' || record.activity === activityFilter;
      return matchesSearch && matchesActivity;
    });
  }, [records, search, activityFilter]);

  const cropColumns = useMemo(() => {
    const set = new Set([...CROP_ITEMS, ...filteredRecords.map((r) => r.crop_item).filter(Boolean)]);
    return Array.from(set);
  }, [filteredRecords]);

  const matrixRows = useMemo(() => {
    const activitySet = new Set([...ACTIVITIES, ...filteredRecords.map((r) => r.activity).filter(Boolean)]);
    return Array.from(activitySet).map((activity) => {
      const cells: Record<string, number> = {};
      filteredRecords
        .filter((r) => r.activity === activity)
        .forEach((r) => { cells[r.crop_item] = (cells[r.crop_item] || 0) + Number(r.quantity || 0); });
      const total = Object.values(cells).reduce((s, v) => s + v, 0);
      return { activity, cells, total };
    });
  }, [filteredRecords]);

  const totals = useMemo(() => {
    const quantity = filteredRecords.reduce((s, r) => s + Number(r.quantity || 0), 0);
    const crops = new Set(filteredRecords.map((r) => r.crop_item)).size;
    const activities = new Set(filteredRecords.map((r) => r.activity)).size;
    return { quantity, crops, activities };
  }, [filteredRecords]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.record_date) next.record_date = 'Date is required';
    if (!formData.activity) next.activity = 'Activity is required';
    if (!formData.crop_item) next.crop_item = 'Crop / Item is required';
    if (!formData.quantity) next.quantity = 'Quantity is required';
    if (!formData.unit) next.unit = 'Unit is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const openAdd = () => { setFormData(emptyForm); setEditId(null); setErrors({}); setIsOpen(true); };
  const openEdit = (record: any) => {
    setFormData({
      record_date: record.record_date?.slice(0, 10) || '',
      activity: record.activity || '',
      crop_item: record.crop_item || '',
      quantity: String(Number(record.quantity || 0)),
      unit: record.unit || 'pcs',
      nursery_site: record.nursery_site || '',
      remarks: record.remarks || '',
    });
    setEditId(record.id);
    setErrors({});
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (editId) {
        const res = await axios.put(`nursery-records/${editId}`, formData);
        setRecords((prev) => prev.map((r) => r.id === editId ? res.data.data : r));
        toast.success('Nursery record updated.');
      } else {
        const res = await axios.post('nursery-records', formData);
        setRecords((prev) => [res.data.data, ...prev]);
        toast.success('Nursery record saved.');
      }
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to save nursery record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (record: any) => {
    const result = await Swal.fire({
      title: 'Delete nursery record?',
      text: `${record.activity} - ${record.crop_item}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`nursery-records/${record.id}`);
      setRecords((prev) => prev.filter((item) => item.id !== record.id));
      toast.success('Nursery record deleted.');
    } catch {
      toast.error('Unable to delete nursery record.');
    }
  };

  const handleGenerateReport = () => {
    const now = new Date();
    const generatedAt = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Nursery site label from records (most common non-empty site)
    const siteCounts: Record<string, number> = {};
    filteredRecords.forEach((r) => { if (r.nursery_site) siteCounts[r.nursery_site] = (siteCounts[r.nursery_site] || 0) + 1; });
    const siteLabel = Object.keys(siteCounts).sort((a, b) => siteCounts[b] - siteCounts[a])[0] || 'NURSERY SITE';

    // Only show activities that have any data
    const activeRows = matrixRows.filter((row) => row.total > 0);
    // Only show crop columns that have any data
    const activeCrops = cropColumns.filter((crop) => activeRows.some((row) => row.cells[crop] > 0));

    const matrixBodyRows = ACTIVITIES.map((activity, i) => {
      const row = activeRows.find((r) => r.activity === activity);
      if (!row) {
        return `<tr>
          <td class="act-cell">${i + 1}. ${escapeHtml(activity)}</td>
          ${activeCrops.map(() => '<td></td>').join('')}
          <td class="total-cell"></td>
        </tr>`;
      }
      return `<tr>
        <td class="act-cell">${i + 1}. ${escapeHtml(activity)}</td>
        ${activeCrops.map((crop) => `<td class="num-cell">${row.cells[crop] ? escapeHtml(formatQty(row.cells[crop])) : ''}</td>`).join('')}
        <td class="total-cell">${row.total ? escapeHtml(formatQty(row.total)) : ''}</td>
      </tr>`;
    }).join('');

    const cropTotals = activeCrops.map((crop) =>
      activeRows.reduce((s, row) => s + (row.cells[crop] || 0), 0)
    );
    const grandTotal = activeRows.reduce((s, row) => s + row.total, 0);

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Nursery Production Records</title>
  <style>
    @page { size: landscape; margin: 15mm 18mm; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background: #fff; padding: 28px 32px; }

    /* ── TOOLBAR (hidden on print) ── */
    .toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; margin-bottom: 20px;
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
    }
    .toolbar-title { font-size: 11pt; font-weight: bold; color: #333; }
    .btn-print {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 20px; background: #16a34a; color: #fff;
      border: none; border-radius: 6px; font-size: 10pt; font-weight: bold;
      cursor: pointer; letter-spacing: 0.03em;
    }
    .btn-print:hover { background: #15803d; }
    .btn-print svg { width: 16px; height: 16px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    @media print { .toolbar { display: none !important; } body { padding: 0; } }

    /* ── PAGE HEADER ── */
    .page-header { text-align: center; margin-bottom: 18px; }
    .page-header .org   { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.04em; }
    .page-header .title { font-size: 14pt;   font-weight: bold; text-transform: uppercase; margin: 5px 0 3px; }
    .page-header .meta  { font-size: 8.5pt;  color: #555; }

    /* ── TABLE ── */
    table { border-collapse: collapse; width: 100%; table-layout: auto; }
    th, td { border: 1px solid #000; vertical-align: middle; }

    .act-header   { text-align: left;   font-weight: bold; font-size: 9pt;   background: #f0f0f0; min-width: 155px; padding: 7px 9px; }
    .site-header  { text-align: center; font-weight: bold; font-size: 10pt;  background: #e0e0e0; padding: 7px 9px; }
    .crop-header  { text-align: center; font-weight: bold; font-size: 7.5pt; background: #f0f0f0; min-width: 55px; word-break: break-word; padding: 6px 4px; }
    .total-header { text-align: center; font-weight: bold; font-size: 9pt;   background: #f0f0f0; min-width: 55px; padding: 7px 6px; }

    .act-cell   { text-align: left;   font-size: 8.5pt; padding: 7px 9px; }
    .num-cell   { text-align: center; font-size: 9pt;   padding: 6px 5px; }
    .total-cell { text-align: center; font-weight: bold; font-size: 9pt; padding: 6px 5px; }

    .grand-row td             { font-weight: bold; background: #e8e8e8; font-size: 9pt; text-align: center; padding: 7px 5px; }
    .grand-row .grand-label   { text-align: left; padding-left: 9px; }

    /* ── FOOTER ── */
    .footer { margin-top: 24px; font-size: 8.5pt; color: #444; display: flex; justify-content: space-between; }
  </style>
</head>
<body>

  <div class="toolbar">
    <span class="toolbar-title">&#128438; Nursery Production Records &mdash; Preview</span>
    <button class="btn-print" onclick="window.print()">
      <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="page-header">
    <div class="org">Municipal Agriculture Office &mdash; Crop Agriculture Division</div>
    <div class="title">Nursery Production Records</div>
    <div class="meta">Date Generated: ${escapeHtml(generatedAt)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th rowspan="2" class="act-header">ACTIVITIES</th>
        <th colspan="${activeCrops.length}" class="site-header">${escapeHtml(siteLabel)}</th>
        <th rowspan="2" class="total-header">TOTAL</th>
      </tr>
      <tr>
        ${activeCrops.map((c) => `<th class="crop-header">${escapeHtml(c)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${matrixBodyRows}
      <tr class="grand-row">
        <td class="grand-label">TOTAL</td>
        ${cropTotals.map((t) => `<td>${t ? escapeHtml(formatQty(t)) : ''}</td>`).join('')}
        <td>${grandTotal ? escapeHtml(formatQty(grandTotal)) : ''}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>Municipal Agriculture Office &bull; Nursery Production Records</span>
    <span>Prepared by: ___________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
  </div>

</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sprout className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Crop Agriculture</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Nursery <span className="text-primary italic">Production Records</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => fetchRecords(true)}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase transition-all cursor-pointer disabled:opacity-30"
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
            <span className={cn(isLoading && 'text-primary cursor-not-allowed')}>{isLoading ? 'Refreshing...' : 'Refresh data'}</span>
          </button>
          <button
            onClick={handleGenerateReport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-primary px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <FileText size={18} /> Generate Report
          </button>
          {canManage && (
            <button
              onClick={openAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              <Plus size={18} /> Log Activity
            </button>
          )}
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard isLoading={isLoading} icon={<Package />} title="Total Quantity" value={totals.quantity.toLocaleString()} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard isLoading={isLoading} icon={<Sprout />} title="Crop / Items" value={totals.crops.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard isLoading={isLoading} icon={<ClipboardList />} title="Activities" value={totals.activities.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col 2xl:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search activity, crop/item, site..."
              className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>
          <CommandFilter label="Activity" value={activityFilter} onChange={setActivityFilter} options={ACTIVITY_FILTER_OPTIONS} />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/10">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">Production Monitoring</p>
            <h3 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tighter">
              Encoded <span className="text-primary italic">Records</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
              <div className="h-full bg-primary w-[40%] animate-progress-loop" />
            </div>
          )}

          <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Activity</th>
                  <th className="px-8 py-5">Crop / Item</th>
                  <th className="px-8 py-5">Quantity</th>
                  <th className="px-8 py-5">Site</th>
                  <th className="px-8 py-5">Remarks</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse bg-white dark:bg-slate-900">
                      <td className="px-8 py-5">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-2">
                          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-36" />
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-28" />
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-3.5 bg-gray-100 dark:bg-slate-800 rounded w-20" />
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-3.5 bg-gray-100 dark:bg-slate-800 rounded w-32" />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                          <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} className="text-gray-400 shrink-0" />
                          {formatDate(record.record_date)}
                        </div>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <p className="text-[13px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-primary transition-colors">
                          {record.activity}
                        </p>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <p className="text-[12px] font-bold text-gray-600 dark:text-slate-300">{record.crop_item}</p>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <p className="text-[13px] font-black text-primary">
                          {formatQty(record.quantity)} <span className="text-[10px] font-bold text-gray-400">{record.unit}</span>
                        </p>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400">{record.nursery_site || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 align-middle max-w-[200px]">
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 truncate">{record.remarks || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManage && (
                            <>
                              <button
                                onClick={() => openEdit(record)}
                                className="p-2.5 text-gray-400 bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(record)}
                                className="p-2.5 text-gray-400 bg-transparent hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-24">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-dashed border-gray-200 dark:border-slate-700 mb-4">
                          <Sprout size={32} className="text-gray-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-1">No Records Found</h3>
                        <p className="text-[11px] font-bold text-gray-400 max-w-xs mx-auto">Try adjusting your search or activity filter to find what you're looking for.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing {filteredRecords.length} of {records.length} Entries
            </p>
          </div>
        </div>
      </div>

      {/* DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setIsOpen(false)} />
          <form onSubmit={handleSubmit} noValidate className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-primary p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center"><Sprout size={20} /></div>
                <div>
                  <h3 className="text-lg font-black uppercase leading-none">{editId ? 'Update Nursery Log' : 'Log Nursery Activity'}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">Seedling Production Monitoring</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} disabled={isSaving} className="p-2 rounded-xl hover:bg-white/10 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput label="Date" type="date" value={formData.record_date} onChange={(v: string) => handleChange('record_date', v)} error={errors.record_date} required icon={<CalendarDays size={14} />} />
              <FormSelect label="Activity" value={formData.activity} onChange={(v: string) => handleChange('activity', v)} options={ACTIVITIES} error={errors.activity} required />
              <FormSelect label="Crop / Item" value={formData.crop_item} onChange={(v: string) => handleChange('crop_item', v)} options={CROP_ITEMS} error={errors.crop_item} required />
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <FormInput label="Quantity" type="number" value={formData.quantity} onChange={(v: string) => handleChange('quantity', v)} error={errors.quantity} required />
                <FormSelect label="Unit" value={formData.unit} onChange={(v: string) => handleChange('unit', v)} options={UNITS} error={errors.unit} required />
              </div>
              <FormInput label="Nursery Site" value={formData.nursery_site} onChange={(v: string) => handleChange('nursery_site', v)} placeholder="Optional" />
              <FormInput label="Remarks" value={formData.remarks} onChange={(v: string) => handleChange('remarks', v)} placeholder="Optional" />
            </div>
            <div className="p-6 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} disabled={isSaving} className="px-5 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-8 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-60">
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Record
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

const formatQty = (value: any) => {
  const number = Number(value || 0);
  if (!number) return '';
  return Number.isInteger(number) ? number.toLocaleString() : number.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const escapeHtml = (value: any) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm overflow-hidden h-28">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
        <div className="space-y-2 w-full">
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
          <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm h-28">
      <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3>
      </div>
    </div>
  );
};

const FieldLabel = ({ label, required }: any) => (
  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
    {label} {required && <span className="text-red-500">*</span>}
  </label>
);

const FieldError = ({ message }: { message?: string }) => (
  message ? <p className="text-[10px] font-bold text-red-500 ml-1">{message}</p> : null
);

const FormInput = ({ label, value, onChange, type = 'text', placeholder, error, required, icon }: any) => (
  <div className="space-y-1.5">
    <FieldLabel label={label} required={required} />
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn('w-full h-11 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary', icon && 'pl-10', error && 'border-red-400 focus:border-red-500')}
      />
    </div>
    <FieldError message={error} />
  </div>
);

const FormSelect = ({ label, value, onChange, options, error, required }: any) => (
  <div className="space-y-1.5">
    <FieldLabel label={label} required={required} />
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn('w-full h-11 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary', error && 'border-red-400 focus:border-red-500')}
    >
      <option value="">Select...</option>
      {options.map((option: string) => <option key={option} value={option}>{option}</option>)}
    </select>
    <FieldError message={error} />
  </div>
);
