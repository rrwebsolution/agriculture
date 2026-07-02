import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../../plugin/axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
  Activity, AlertCircle, ArrowLeft, BarChart3, Calendar, CalendarDays, Check, ChevronsUpDown,
  ClipboardList, Edit3, Eye, FileText, Leaf, Loader2, Package, PieChart as PieChartIcon,
  Plus, RefreshCw, Save, Search, Sprout, Trash2, X,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../../../lib/utils';
import { getPageAccess } from '../../../lib/permissions';
import { useLocation } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';
import { TableSortControl, sortRecordsAlphabetically, type TableSortValue } from '../../../components/ui/table-sort-control';

const CHART_COLORS = [
  '#16a34a', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899',
  '#14b8a6', '#ef4444', '#eab308', '#6366f1', '#84cc16',
  '#f43f5e', '#d946ef', '#06b6d4', '#10b981', '#3b82f6',
];

const FORM_ACTIVITIES = [
  'Collection of Scion',
  'Collection of Seed',
  'Collection of Seedlings',
  'Germination',
];

const STANDALONE_INPUT_LABELS = [
  'No. of Bagging',
  'No. of Seedlings Planted',
  'No. of Garden Soil',
  'No. of Disposal Seedlings',
];

const ACTIVITIES = [...FORM_ACTIVITIES, ...STANDALONE_INPUT_LABELS];

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

const makeDefaultCropEntry = () => ({
  quantity: '',
  unit: 'pcs',
  standalone_inputs: STANDALONE_INPUT_LABELS.map(label => ({ label, value: '' })) as Array<{ label: string; value: string; custom?: boolean }>,
});

const emptyForm = {
  record_date: new Date().toISOString().slice(0, 10),
  activities: [] as string[],
  crop_items: [] as string[],
  nursery_site: '',
  remarks: '',
  crop_data: {} as Record<string, ReturnType<typeof makeDefaultCropEntry>>,
  // edit-mode flat fields
  edit_activity: '',
  edit_crop_item: '',
  edit_quantity: '0',
  edit_unit: 'pcs',
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const datePart = String(dateStr).split('T')[0].split(' ')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return 'N/A';
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tableSort, setTableSort] = useState<TableSortValue>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [formData, setFormData] = useState<any>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewTx, setViewTx] = useState<any | null>(null);
  const [editReturnTx, setEditReturnTx] = useState<any | null>(null);
  const [viewTxSearch, setViewTxSearch] = useState('');
  const [viewTxActivityFilter, setViewTxActivityFilter] = useState('All');
  const isSubmittingRef = React.useRef(false);

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
    return sortRecordsAlphabetically(
      records.filter((record) => {
        const matchesSearch = [record.activity, record.crop_item, record.unit, record.nursery_site, record.remarks]
          .join(' ')
          .toLowerCase()
          .includes(q);
        const recordDate = String(record.record_date).split('T')[0].split(' ')[0];
        const matchesFrom = !dateFrom || recordDate >= dateFrom;
        const matchesTo = !dateTo || recordDate <= dateTo;
        return matchesSearch && matchesFrom && matchesTo;
      }),
      (r: any) => r.activity,
      tableSort,
    );
  }, [records, search, dateFrom, dateTo, tableSort]);

  const transactions = useMemo(() => {
    const map = new Map<string, { key: string; record_date: string; nursery_site: string; remarks: string; records: any[] }>();
    filteredRecords.forEach((r) => {
      const key = [r.record_date, r.nursery_site || '', r.remarks || ''].join('|');
      if (!map.has(key)) {
        map.set(key, { key, record_date: r.record_date, nursery_site: r.nursery_site || '', remarks: r.remarks || '', records: [] });
      }
      map.get(key)!.records.push(r);
    });
    return Array.from(map.values());
  }, [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE));
  const currentItems = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, tableSort]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setViewTxSearch('');
    setViewTxActivityFilter('All');
  }, [viewTx?.key]);

  const totals = useMemo(() => {
    const quantity = filteredRecords.reduce((s, r) => s + Number(r.quantity || 0), 0);
    const crops = new Set(filteredRecords.map((r) => r.crop_item)).size;
    const activities = new Set(filteredRecords.map((r) => r.activity)).size;
    return { quantity, crops, activities };
  }, [filteredRecords]);

  const barChartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      if (r.activity) grouped[r.activity] = (grouped[r.activity] || 0) + Number(r.quantity || 0);
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  const pieChartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      if (r.crop_item) grouped[r.crop_item] = (grouped[r.crop_item] || 0) + Number(r.quantity || 0);
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  const handleCropItemsChange = (newCrops: string[]) => {
    setFormData((prev: any) => {
      const newCropData: any = {};
      newCrops.forEach((c: string) => {
        newCropData[c] = prev.crop_data[c] || makeDefaultCropEntry();
      });
      return { ...prev, crop_items: newCrops, crop_data: newCropData };
    });
    setErrors((prev) => { const next = { ...prev }; delete next.crop_items; return next; });
  };

  const updateCropData = (crop: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      crop_data: { ...prev.crop_data, [crop]: { ...prev.crop_data[crop], [key]: value } },
    }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.record_date) next.record_date = 'Date is required';
    if (editId) {
      if (!formData.edit_activity) next.edit_activity = 'Activity is required';
      if (!formData.edit_crop_item) next.edit_crop_item = 'Crop / Item is required';
    } else {
      if (!(formData.crop_items || []).length) next.crop_items = 'Select at least one Crop / Item';
      for (const crop of (formData.crop_items || [])) {
        const cd = formData.crop_data[crop] || {};
        const hasQty = (formData.activities || []).length > 0;
        const hasStandalone = (cd.standalone_inputs || []).some((inp: any) => !!inp.value);
        if (!hasQty && !hasStandalone) next[`crop_err_${crop}`] = 'Fill in at least one value for this crop.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const openAdd = () => { setFormData(emptyForm); setEditId(null); setEditReturnTx(null); setErrors({}); setIsOpen(true); };
  const openEdit = (record: any, returnTx: any | null = null) => {
    setFormData({
      ...emptyForm,
      record_date: String(record.record_date || '').split('T')[0].split(' ')[0] || '',
      edit_unit: record.unit || 'pcs',
      nursery_site: record.nursery_site || '',
      remarks: record.remarks || '',
      edit_activity: record.activity || '',
      edit_crop_item: record.crop_item || '',
      edit_quantity: String(Number(record.quantity ?? 0)),
    });
    setEditId(record.id);
    setEditReturnTx(returnTx);
    setErrors({});
    setIsOpen(true);
  };

  const closeLogModal = () => {
    setIsOpen(false);
    setEditReturnTx(null);
  };

  const backToTransactionDetails = () => {
    if (!editReturnTx) return closeLogModal();
    setIsOpen(false);
    setEditReturnTx(null);
    setViewTx(editReturnTx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    if (!validate()) { isSubmittingRef.current = false; return; }
    setIsSaving(true);
    try {
      const base = { record_date: formData.record_date, nursery_site: formData.nursery_site, remarks: formData.remarks };
      if (editId) {
        const payload = {
          ...base,
          activity: formData.edit_activity,
          crop_item: formData.edit_crop_item,
          quantity: formData.edit_quantity || '0',
          unit: formData.edit_unit || 'pcs',
        };
        const res = await axios.put(`nursery-records/${editId}`, payload);
        setRecords((prev) => prev.map((r) => r.id === editId ? res.data.data : r));
        toast.success('Nursery record updated.');
      } else {
        const recordsToCreate: any[] = [];
        for (const crop_item of (formData.crop_items || [])) {
          const cd = formData.crop_data[crop_item] || {};
          // activity × crop records
          if ((formData.activities || []).length > 0) {
            for (const activity of formData.activities) {
              const quantity = cd.quantity === '' || cd.quantity == null ? '0' : cd.quantity;
              recordsToCreate.push({ ...base, activity, crop_item, quantity, unit: cd.unit || 'pcs' });
            }
          }
          // standalone + custom inputs per crop
          for (const inp of (cd.standalone_inputs || [])) {
            if (inp.value && inp.label) {
              recordsToCreate.push({ ...base, activity: inp.label, crop_item, quantity: inp.value, unit: cd.unit || 'pcs' });
            }
          }
        }
        if (!recordsToCreate.length) { toast.error('Nothing to save. Please fill in at least one value.'); return; }
        const results = await Promise.all(recordsToCreate.map((r) => axios.post('nursery-records', r)));
        const newRecords = results.map((res) => res.data.data);
        setRecords((prev) => [...newRecords, ...prev]);
        toast.success(`${newRecords.length} nursery record${newRecords.length > 1 ? 's' : ''} saved.`);
      }
      closeLogModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to save nursery record.');
    } finally {
      setIsSaving(false);
      isSubmittingRef.current = false;
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
      setViewTx((prev: any) => {
        if (!prev) return null;
        const updated = { ...prev, records: prev.records.filter((r: any) => r.id !== record.id) };
        return updated.records.length > 0 ? updated : null;
      });
      toast.success('Nursery record deleted.');
    } catch {
      toast.error('Unable to delete nursery record.');
    }
  };

  const handleDeleteTransaction = async (tx: any) => {
    const result = await Swal.fire({
      title: `Delete ${tx.records.length} record${tx.records.length !== 1 ? 's' : ''}?`,
      text: `All records for ${formatDate(tx.record_date)} will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete all',
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(tx.records.map((r: any) => axios.delete(`nursery-records/${r.id}`)));
      const deletedIds = new Set(tx.records.map((r: any) => r.id));
      setRecords((prev) => prev.filter((item) => !deletedIds.has(item.id)));
      setViewTx(null);
      toast.success(`${tx.records.length} record${tx.records.length !== 1 ? 's' : ''} deleted.`);
    } catch {
      toast.error('Unable to delete records.');
    }
  };

  const handleGenerateReport = (txRecords: any[]) => {
    const now = new Date();
    const generatedAt = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const siteCounts: Record<string, number> = {};
    txRecords.forEach((r) => { if (r.nursery_site) siteCounts[r.nursery_site] = (siteCounts[r.nursery_site] || 0) + 1; });
    const siteLabel = Object.keys(siteCounts).sort((a, b) => siteCounts[b] - siteCounts[a])[0] || 'NURSERY SITE';

    const txActivitySet = new Set([...ACTIVITIES, ...txRecords.map((r: any) => r.activity).filter(Boolean)]);
    const txMatrixRows = Array.from(txActivitySet).map((activity) => {
      const cells: Record<string, number> = {};
      txRecords.filter((r: any) => r.activity === activity).forEach((r: any) => { cells[r.crop_item] = (cells[r.crop_item] || 0) + Number(r.quantity || 0); });
      const total = Object.values(cells).reduce((s, v) => s + v, 0);
      return { activity, cells, total };
    });
    const txCropSet = new Set([...CROP_ITEMS, ...txRecords.map((r: any) => r.crop_item).filter(Boolean)]);
    const txCropColumns = Array.from(txCropSet);

    const activeRows = txMatrixRows.filter((row) => row.total > 0);
    const activeCrops = txCropColumns.filter((crop) => activeRows.some((row) => row.cells[crop] > 0));

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
    body { font-family: Roboto, Arial, Helvetica, sans-serif; font-size: 9pt; color: #000; background: #fff; padding: 28px 32px; }

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
    th, td { border: 1px solid #d1d5db; vertical-align: middle; }

    .act-header   { text-align: left;   font-weight: bold; font-size: 9pt;   background: #2D6A4F; color: #fff; min-width: 155px; padding: 7px 9px; text-transform: uppercase; letter-spacing: 0.5px; }
    .site-header  { text-align: center; font-weight: bold; font-size: 10pt;  background: #2D6A4F; color: #fff; padding: 7px 9px; text-transform: uppercase; letter-spacing: 0.5px; }
    .crop-header  { text-align: center; font-weight: bold; font-size: 7.5pt; background: #2D6A4F; color: #fff; min-width: 55px; word-break: break-word; padding: 6px 4px; text-transform: uppercase; }
    .total-header { text-align: center; font-weight: bold; font-size: 9pt;   background: #2D6A4F; color: #fff; min-width: 55px; padding: 7px 6px; text-transform: uppercase; letter-spacing: 0.5px; }

    .act-cell   { text-align: left;   font-size: 8.5pt; padding: 7px 9px; }
    .num-cell   { text-align: center; font-size: 9pt;   padding: 6px 5px; }
    .total-cell { text-align: center; font-weight: bold; font-size: 9pt;  padding: 6px 5px; background: #f0fdf4; }

    .grand-row td             { font-weight: bold; background: #f0fdf4; border-top: 2px solid #2D6A4F; font-size: 9pt; text-align: center; padding: 7px 5px; }
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
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl px-4 h-13">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-600 dark:text-slate-300"
              />
            </div>
            <span className="text-gray-400 text-xs font-bold shrink-0">—</span>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl px-4 h-13">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-600 dark:text-slate-300"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="p-2 text-red-300 hover:text-red-500 transition-colors cursor-pointer"
                title="Clear date filter"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
          <Activity className="text-primary" size={20} />
          <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            Analytics <span className="text-primary italic">Overview</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <div className="lg:col-span-2"><ChartSkeleton title="Quantity by Activity" icon={BarChart3} /></div>
              <div className="lg:col-span-1"><ChartSkeleton title="Crop / Item Distribution" icon={PieChartIcon} /></div>
            </>
          ) : (
            <>
              {/* BAR CHART — Quantity by Activity */}
              <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col h-80">
                <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-200 shrink-0">
                  <BarChart3 size={16} className="text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Quantity by Activity</h3>
                </div>
                <div className="flex-1 w-full min-h-0">
                  {barChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }}
                          dy={8}
                          tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: '#16a34a', opacity: 0.05 }} />
                        <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                      <BarChart3 size={48} strokeWidth={1} className="mb-2 opacity-40" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Activity Data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PIE CHART — Quantity by Crop/Item */}
              <div className="lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col h-80">
                <div className="flex items-center gap-2 mb-3 text-gray-800 dark:text-slate-200 shrink-0">
                  <PieChartIcon size={16} className="text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Crop / Item Distribution</h3>
                </div>
                {pieChartData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    No Data Available
                  </div>
                ) : (
                  <>
                    <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieChartData.map((_, i) => (
                              <Cell
                                key={`cell-${i}`}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                                className="hover:opacity-80 transition-opacity"
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} cursor={{ fill: 'transparent' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="shrink-0 overflow-y-auto max-h-[72px] custom-scrollbar mt-2">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {pieChartData.map((entry, i) => (
                          <div key={entry.name} className="flex items-center gap-1 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-[8.5px] font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
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
          <TableSortControl value={tableSort} onChange={setTableSort} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
              <div className="h-full bg-primary w-[40%] animate-progress-loop" />
            </div>
          )}

          <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Created Date</th>
                  <th className="px-8 py-5">Site</th>
                  <th className="px-8 py-5">Unit</th>
                  <th className="px-8 py-5">Records</th>
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
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-28" />
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-3.5 bg-gray-100 dark:bg-slate-800 rounded w-16" />
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-3.5 bg-gray-100 dark:bg-slate-800 rounded w-12" />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                          <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                          <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : currentItems.length > 0 ? (
                  currentItems.map((tx: any) => (
                    <tr key={tx.key} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} className="text-gray-400 shrink-0" />
                          {formatDate(tx.record_date)}
                        </div>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <p className="text-[12px] font-bold text-gray-600 dark:text-slate-300">{tx.nursery_site || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {[...new Set<string>(tx.records.map((r: any) => r.unit))].map((u) => (
                            <span key={u} className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase">{u}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <span className="text-[13px] font-black text-gray-800 dark:text-slate-200">{tx.records.length}</span>
                        <span className="ml-1 text-[10px] font-bold text-gray-400">record{tx.records.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewTx(tx)}
                            className="p-2.5 text-gray-400 bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer"
                            title="View Transaction"
                          >
                            <Eye size={16} />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => handleDeleteTransaction(tx)}
                              className="p-2.5 text-gray-400 bg-transparent hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-24">
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

          <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing {currentItems.length} of {transactions.length} Transactions
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setCurrentPage(n)} className={cn('w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center', currentPage === n ? 'bg-primary text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800')}>{n}</button>
              ))}
              <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isSaving && closeLogModal()} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">

            {/* Header */}
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-white">
                {editId && editReturnTx ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={backToTransactionDetails}
                    className="h-10 w-10 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm cursor-pointer transition-colors disabled:opacity-50"
                    title="Back to Transaction Details"
                  >
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sprout size={20} />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                    {editId ? 'Update Nursery Log' : 'Log Nursery Activity'}
                  </h2>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Seedling Production Monitoring</p>
                </div>
              </div>
              <button type="button" disabled={isSaving} onClick={closeLogModal} className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl text-white cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                {/* 1. Date */}
                <div className="space-y-5">
                  <NurserySectionLabel icon={<CalendarDays size={14} />} text="1. Record Date" />
                  <FormInput label="Date" type="date" value={formData.record_date} onChange={(v: string) => handleChange('record_date', v)} error={errors.record_date} required icon={<CalendarDays size={14} />} />
                </div>

                <div className="h-px bg-gray-100 dark:bg-slate-800" />

                {editId ? (
                  /* ── EDIT MODE: simple flat fields ── */
                  <>
                    <div className="space-y-5">
                      <NurserySectionLabel icon={<Activity size={14} />} text="2. Activity" />
                      <CustomCommandPicker
                        label="Activity"
                        value={formData.edit_activity}
                        onChange={(v: string) => handleChange('edit_activity', v)}
                        options={ACTIVITIES}
                        placeholder="Select activity..."
                        error={errors.edit_activity}
                        required
                      />
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    <div className="space-y-5">
                      <NurserySectionLabel icon={<Leaf size={14} />} text="3. Crop / Item" />
                      <CustomCommandPicker
                        label="Crop / Item"
                        value={formData.edit_crop_item}
                        onChange={(v: string) => handleChange('edit_crop_item', v)}
                        options={CROP_ITEMS}
                        placeholder="Select crop / item..."
                        error={errors.edit_crop_item}
                        required
                      />
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    <div className="space-y-5">
                      <NurserySectionLabel icon={<Package size={14} />} text="4. Quantity & Unit" />
                      <div className="grid grid-cols-2 gap-3">
                        <FormInput
                          label="Quantity"
                          type="number"
                          value={formData.edit_quantity}
                          onChange={(v: string) => handleChange('edit_quantity', v)}
                          placeholder="e.g. 100"
                          required
                        />
                        <div className="space-y-1.5">
                          <FieldLabel label="Unit" required />
                          <SingleCommandPicker
                            value={formData.edit_unit}
                            onChange={(v: string) => handleChange('edit_unit', v)}
                            options={UNITS}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── ADD MODE: multi-select form ── */
                  <>
                    {/* 2. Activity */}
                    <div className="space-y-4">
                      <NurserySectionLabel icon={<Activity size={14} />} text="2. Activity" />
                      <MultiCommandPicker
                        label="Activity"
                        value={formData.activities}
                        onChange={(v: string[]) => handleChange('activities', v)}
                        options={FORM_ACTIVITIES}
                        placeholder="Select one or more activities..."
                        showSelectAll
                      />
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* 3. Crop / Item */}
                    <div className="space-y-5">
                      <NurserySectionLabel icon={<Leaf size={14} />} text="3. Crop / Item" />
                      <MultiCommandPicker
                        label="Crop / Item"
                        value={formData.crop_items}
                        onChange={handleCropItemsChange}
                        options={CROP_ITEMS}
                        placeholder="Select one or more crop items..."
                        error={errors.crop_items}
                        required
                        showSelectAll
                      />
                    </div>
                  </>
                )}

                {/* 4. Per-Crop Data (add mode only) */}
                {!editId && (formData.crop_items || []).length > 0 && (
                  <>
                    <div className="h-px bg-gray-100 dark:bg-slate-800" />
                    <div className="space-y-5">
                      <NurserySectionLabel icon={<Package size={14} />} text="4. Per Crop / Item" />
                      <div className="space-y-4">
                        {(formData.crop_items || []).map((crop: string) => {
                          const cd = formData.crop_data[crop] || makeDefaultCropEntry();
                          const fixedInputs = (cd.standalone_inputs || []).filter((inp: any) => !inp.custom);
                          const customInputs = (cd.standalone_inputs || []).filter((inp: any) => inp.custom);
                          const allInputs: any[] = cd.standalone_inputs || [];
                          const cropErr = errors[`crop_err_${crop}`];
                          return (
                            <div key={crop} className={cn('bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4 border transition-colors', cropErr ? 'border-red-400 dark:border-red-500' : 'border-gray-100 dark:border-slate-700')}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={cn('w-2 h-2 rounded-full shrink-0', cropErr ? 'bg-red-500' : 'bg-primary')} />
                                  <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-tight">{crop}</p>
                                </div>
                                {cropErr && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                                    <AlertCircle size={10} /> {cropErr}
                                  </span>
                                )}
                              </div>

                              {/* Unit + Quantity (2 columns; Quantity only when activities selected) */}
                              {(formData.activities || []).length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <FieldLabel label="Quantity" required />
                                    <input
                                      type="number"
                                      value={cd.quantity}
                                      placeholder="e.g. 100"
                                      onChange={(e) => updateCropData(crop, 'quantity', e.target.value)}
                                      className="w-full h-11 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <FieldLabel label="Unit" required />
                                    <SingleCommandPicker
                                      value={cd.unit || 'pcs'}
                                      onChange={(v: string) => updateCropData(crop, 'unit', v)}
                                      options={UNITS}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <FieldLabel label="Unit" required />
                                  <SingleCommandPicker
                                    value={cd.unit || 'pcs'}
                                    onChange={(v: string) => updateCropData(crop, 'unit', v)}
                                    options={UNITS}
                                  />
                                </div>
                              )}

                              {/* Fixed standalone counts */}
                              <div className="grid grid-cols-2 gap-3">
                                {fixedInputs.map((inp: any) => (
                                  <div key={inp.label} className="space-y-1.5">
                                    <FieldLabel label={inp.label} />
                                    <input
                                      type="number"
                                      value={inp.value}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const next = allInputs.map((x: any) => x.label === inp.label && !x.custom ? { ...x, value: e.target.value } : x);
                                        updateCropData(crop, 'standalone_inputs', next);
                                      }}
                                      className="w-full h-11 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Custom inputs */}
                              {customInputs.map((inp: any, ci: number) => {
                                const realIdx = allInputs.indexOf(inp);
                                return (
                                  <div key={`custom-${ci}`} className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1.5">
                                      {ci === 0 && <FieldLabel label="Label" />}
                                      <input type="text" value={inp.label} placeholder="Activity name..."
                                        onChange={(e) => {
                                          const next = [...allInputs]; next[realIdx] = { ...next[realIdx], label: e.target.value };
                                          updateCropData(crop, 'standalone_inputs', next);
                                        }}
                                        className="w-full h-11 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                                      />
                                    </div>
                                    <div className="w-28 space-y-1.5">
                                      {ci === 0 && <FieldLabel label="Qty" />}
                                      <input type="number" value={inp.value} placeholder="0"
                                        onChange={(e) => {
                                          const next = [...allInputs]; next[realIdx] = { ...next[realIdx], value: e.target.value };
                                          updateCropData(crop, 'standalone_inputs', next);
                                        }}
                                        className="w-full h-11 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                                      />
                                    </div>
                                    <button type="button"
                                      onClick={() => updateCropData(crop, 'standalone_inputs', allInputs.filter((_: any, j: number) => j !== realIdx))}
                                      className={cn('p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer', ci === 0 && 'mt-5')}
                                    >
                                      <X size={15} />
                                    </button>
                                  </div>
                                );
                              })}

                              <button type="button"
                                onClick={() => updateCropData(crop, 'standalone_inputs', [...allInputs, { label: '', value: '', custom: true }])}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-primary/40 text-primary text-[10px] font-black uppercase hover:bg-primary/5 transition-all cursor-pointer w-full justify-center"
                              >
                                <Plus size={13} /> Add Input Field
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-gray-100 dark:bg-slate-800" />

                {/* 5. Details */}
                <div className="space-y-5">
                  <NurserySectionLabel icon={<ClipboardList size={14} />} text="5. Details" />
                  <FormInput label="Nursery Site" value={formData.nursery_site} onChange={(v: string) => handleChange('nursery_site', v)} placeholder="Optional" />
                  <FormInput label="Remarks" value={formData.remarks} onChange={(v: string) => handleChange('remarks', v)} placeholder="Optional notes..." />
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-4 shrink-0">
                <button type="button" onClick={() => setIsOpen(false)} disabled={isSaving} className="px-6 text-[10px] font-black uppercase text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className={cn('px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95', isSaving && 'opacity-50 pointer-events-none')}>
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isSaving ? 'Processing...' : editId ? 'Update Log' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TRANSACTION MODAL */}
      {viewTx && (() => {
        const txFiltered = viewTx.records.filter((r: any) => {
          const q = viewTxSearch.toLowerCase();
          const matchesSearch = [r.activity, r.crop_item].join(' ').toLowerCase().includes(q);
          const matchesFilter = viewTxActivityFilter === 'All' || r.activity === viewTxActivityFilter;
          return matchesSearch && matchesFilter;
        });
        const txActivityOptions: string[] = [...new Set<string>(viewTx.records.map((r: any) => r.activity as string))];
        return (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setViewTx(null)} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">

              {/* Header */}
              <div className="bg-primary p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-white">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight leading-none">Transaction Details</h2>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">{formatDate(viewTx.record_date)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setViewTx(null)} className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl text-white cursor-pointer transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Meta info */}
              <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 grid grid-cols-3 gap-4 shrink-0">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Site</p>
                  <p className="text-[12px] font-bold text-gray-700 dark:text-slate-200">{viewTx.nursery_site || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Unit</p>
                  <p className="text-[12px] font-bold text-gray-700 dark:text-slate-200">
                    {[...new Set<string>(viewTx.records.map((r: any) => r.unit))].join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Remarks</p>
                  <p className="text-[12px] font-bold text-gray-700 dark:text-slate-200 truncate">{viewTx.remarks || 'N/A'}</p>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search activity or crop..."
                    value={viewTxSearch}
                    onChange={(e) => setViewTxSearch(e.target.value)}
                    className="w-full pl-9 pr-8 h-10 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[11px] font-bold outline-none focus:border-primary transition-all"
                  />
                  {viewTxSearch && (
                    <button onClick={() => setViewTxSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300 hover:text-red-500 cursor-pointer transition-colors">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <ActivityFilterPicker
                  value={viewTxActivityFilter}
                  onChange={setViewTxActivityFilter}
                  options={txActivityOptions}
                />
              </div>

              {/* Records list */}
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Activity</th>
                      <th className="px-8 py-4">Crop / Item</th>
                      <th className="px-8 py-4">Quantity</th>
                      {canManage && <th className="px-8 py-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                    {txFiltered.length > 0 ? txFiltered.map((r: any) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-4">
                          <p className="text-[12px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{r.activity}</p>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-[12px] font-bold text-gray-600 dark:text-slate-300">{r.crop_item}</p>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-[13px] font-black text-primary">
                            {formatQty(r.quantity)} <span className="text-[10px] font-bold text-gray-400">{r.unit}</span>
                          </p>
                        </td>
                        {canManage && (
                          <td className="px-8 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { const tx = viewTx; setViewTx(null); openEdit(r, tx); }}
                                className="p-2 text-gray-400 hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(r)}
                                className="p-2 text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={canManage ? 4 : 3} className="py-14">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Search size={28} className="text-gray-200 dark:text-slate-700 mb-3" />
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No results found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {txFiltered.length} of {viewTx.records.length} Record{viewTx.records.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setViewTx(null)} className="px-6 text-[10px] font-black uppercase text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateReport(viewTx.records)}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer hover:opacity-90"
                  >
                    <FileText size={15} /> Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

const ChartSkeleton = ({ title, icon: Icon }: any) => (
  <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm h-80 flex flex-col overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-30">
      <div className="h-full bg-primary w-[40%] animate-progress-loop" />
    </div>
    <div className="flex items-center gap-2 mb-4 shrink-0 text-gray-300 dark:text-slate-600">
      <Icon size={16} />
      <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
    </div>
    <div className="flex-1 w-full bg-gray-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
  </div>
);

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl z-50">
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-primary">{Number(payload[0].value).toLocaleString()} pcs</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl z-50 flex items-center gap-3">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: payload[0].payload.fill }} />
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{payload[0].name}</p>
        <p className="text-xs font-black text-gray-800 dark:text-white">{Number(payload[0].value).toLocaleString()} pcs</p>
      </div>
    </div>
  );
};

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

const NurserySectionLabel = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-primary">
    <div className="p-1.5 bg-primary/10 rounded-xl">{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
  </div>
);

const SingleCommandPicker = ({ value, onChange, options, placeholder = 'Select...' }: any) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-11 flex items-center justify-between gap-2 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-left cursor-pointer hover:border-primary/40 outline-none transition-all"
        >
          <span className={cn('text-xs font-bold', value ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 font-normal')}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-44 bg-white dark:bg-slate-900 rounded-2xl z-[200] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandList className="max-h-48 custom-scrollbar p-1">
            <CommandGroup>
              {options.map((opt: string) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => { onChange(opt); setOpen(false); }}
                  className="flex items-center justify-between text-[11px] font-bold uppercase py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  {opt}
                  {value === opt && <Check size={13} className="text-primary shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const CustomCommandPicker = ({ label, value, onChange, options, placeholder = 'Select...', error, required }: any) => {
  const [open, setOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addValue, setAddValue] = React.useState('');
  const pickerOptions = [...options, ...(value && !options.some((opt: string) => opt.toLowerCase() === value.toLowerCase()) ? [value] : [])];
  const addButtonLabel = label === 'Activity' ? 'Add Activity' : 'Add Crop / Item';

  const saveCustomEntry = () => {
    const nextValue = addValue.trim();
    if (!nextValue) return;
    const existing = pickerOptions.find((opt: string) => opt.toLowerCase() === nextValue.toLowerCase());
    onChange(existing || nextValue);
    setAddValue('');
    setAddOpen(false);
  };

  return (
    <>
      <div className="space-y-1.5 w-full">
        <FieldLabel label={label} required={required} />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-full h-11 flex items-center justify-between gap-2 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-left cursor-pointer hover:border-primary/40 outline-none transition-all',
                error && 'border-red-400',
              )}
            >
              <span className={cn('text-xs font-bold uppercase truncate', value ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 font-normal normal-case')}>
                {value || placeholder}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-72 bg-white dark:bg-slate-900 rounded-2xl z-[200] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <Command>
              <CommandInput
                placeholder={`Search ${label.toLowerCase()}...`}
                className="border-none focus:ring-0 text-xs"
              />
              <CommandList className="max-h-56 custom-scrollbar p-1">
                <CommandEmpty className="py-4 text-[10px] font-bold uppercase text-center text-gray-400">No results.</CommandEmpty>
                <CommandGroup>
                  {pickerOptions.map((opt: string) => (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={() => { onChange(opt); setOpen(false); }}
                      className="flex items-center justify-between text-[11px] font-bold uppercase py-3 px-4 rounded-xl cursor-pointer"
                    >
                      {opt}
                      {value === opt && <Check size={13} className="text-primary shrink-0" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <div className="h-px bg-gray-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => { setAddOpen(true); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors"
                >
                  <Plus size={14} /> {addButtonLabel}
                </button>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {error && (
          <p className="ml-1 flex items-center gap-1 text-[10px] font-bold text-red-500">
            <AlertCircle size={10} /> {error}
          </p>
        )}
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddOpen(false)} />
          <div
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              saveCustomEntry();
            }}
          >
            <h3 className="font-black text-primary uppercase text-sm mb-6 flex items-center gap-2">
              <Plus size={16} /> {addButtonLabel}
            </h3>
            <div className="space-y-6">
              <FormInput
                label={label}
                placeholder={`Enter ${label.toLowerCase()}...`}
                value={addValue}
                onChange={setAddValue}
                required
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                <button type="button" onClick={saveCustomEntry} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl cursor-pointer hover:opacity-90 shadow-md">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ActivityFilterPicker = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-10 flex items-center justify-between gap-2 px-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[11px] font-bold outline-none focus:border-primary transition-all cursor-pointer shrink-0 min-w-[148px]"
        >
          <span className="truncate">{value === 'All' ? 'All Activities' : value}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64 bg-white dark:bg-slate-900 rounded-2xl z-[200] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search activity..." className="border-none focus:ring-0 text-xs" />
          <CommandList className="max-h-56 custom-scrollbar p-1">
            <CommandEmpty className="py-4 text-[10px] font-bold uppercase text-center text-gray-400">No results.</CommandEmpty>
            <CommandGroup>
              {['All', ...options].map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => { onChange(opt); setOpen(false); }}
                  className="flex items-center justify-between text-[11px] font-bold uppercase py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  {opt === 'All' ? 'All Activities' : opt}
                  {value === opt && <Check size={13} className="text-primary shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const MultiCommandPicker = ({ label, value, onChange, options, placeholder, error, required, showSelectAll }: any) => {
  const [open, setOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addValue, setAddValue] = React.useState('');
  const selected: string[] = value || [];
  const pickerOptions = [...options, ...selected.filter((s: string) => !options.some((opt: string) => opt.toLowerCase() === s.toLowerCase()))];
  const allSelected = pickerOptions.length > 0 && pickerOptions.every((opt: string) => selected.includes(opt));
  const addButtonLabel = label === 'Activity' ? 'Add Activity' : 'Add Crop / Item';

  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt]);
  };

  const saveCustomEntry = () => {
    const nextValue = addValue.trim();
    if (!nextValue) return;
    const existing = pickerOptions.find((opt: string) => opt.toLowerCase() === nextValue.toLowerCase());
    const valueToUse = existing || nextValue;
    if (!selected.some((s: string) => s.toLowerCase() === valueToUse.toLowerCase())) {
      onChange([...selected, valueToUse]);
    }
    setAddValue('');
    setAddOpen(false);
  };

  const remove = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s: string) => s !== opt));
  };

  return (
    <>
    <div className="space-y-1.5 w-full">
      <FieldLabel label={label} required={required} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full min-h-11 flex items-start justify-between gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-left cursor-pointer hover:border-primary/40 outline-none transition-all',
              error && 'border-red-400',
            )}
          >
            <div className="flex flex-wrap gap-1.5 flex-1">
              {selected.length === 0 ? (
                <span className="text-[11px] text-gray-400 font-normal self-center">{placeholder}</span>
              ) : (
                selected.map((s: string) => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase leading-none">
                    {s}
                    <span onClick={(e) => remove(s, e)} className="cursor-pointer hover:text-red-500 transition-colors ml-0.5">×</span>
                  </span>
                ))
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0 mt-0.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-72 bg-white dark:bg-slate-900 rounded-2xl z-[200] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <Command>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              className="border-none focus:ring-0 text-xs"
            />
            <CommandList className="max-h-56 custom-scrollbar p-1">
              <CommandEmpty className="py-4 text-[10px] font-bold uppercase text-center text-gray-400">No results.</CommandEmpty>
              <CommandGroup>
                {showSelectAll && (
                  <CommandItem
                    value="__select_all__"
                    onSelect={() => onChange(allSelected ? [] : [...pickerOptions])}
                    className="flex items-center justify-between text-[11px] font-black uppercase py-3 px-4 rounded-xl cursor-pointer text-primary border-b border-gray-100 dark:border-slate-700 mb-1"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                    {allSelected && <Check size={13} className="text-primary shrink-0" />}
                  </CommandItem>
                )}
                {pickerOptions.map((opt: string) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => toggle(opt)}
                    className="flex items-center justify-between text-[11px] font-bold uppercase py-3 px-4 rounded-xl cursor-pointer"
                  >
                    {opt}
                    {selected.includes(opt) && <Check size={13} className="text-primary shrink-0" />}
                  </CommandItem>
                ))}
              </CommandGroup>
              <div className="h-px bg-gray-100 dark:bg-slate-800 my-1" />
              <button
                type="button"
                onClick={() => { setAddOpen(true); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors"
              >
                <Plus size={14} /> {addButtonLabel}
              </button>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="ml-1 flex items-center gap-1 text-[10px] font-bold text-red-500">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>

    {addOpen && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddOpen(false)} />
        <div
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            saveCustomEntry();
          }}
        >
          <h3 className="font-black text-primary uppercase text-sm mb-6 flex items-center gap-2">
            <Plus size={16} /> {addButtonLabel}
          </h3>
          <div className="space-y-6">
            <FormInput
              label={label}
              placeholder={`Enter ${label.toLowerCase()}...`}
              value={addValue}
              onChange={setAddValue}
              required
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
              <button type="button" onClick={saveCustomEntry} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl cursor-pointer hover:opacity-90 shadow-md">Save</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
