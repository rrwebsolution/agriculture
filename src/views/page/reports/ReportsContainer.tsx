import { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter,
  RefreshCw, X, Calendar,
  ClipboardCheck, Clock, BarChart3,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import { cn } from '../../../lib/utils';
import axios from '../../../plugin/axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store/store';
import { setReportData, addReport, removeReport } from '../../../store/slices/reportSlice';
import { getPageAccess } from '../../../lib/permissions';
import { useLocation } from 'react-router-dom';

import ReportMetricCard from './card/ReportMetricCard';
import ReportTypeBreakdown from './ReportTypeBreakdown';
import ReportsTable from './table/ReportsTable';
import GenerateReportModal from './modals/GenerateReportModal';
import ViewReportModal from './modals/ViewReportModal';

const REPORT_TYPES = ['All Classifications', 'Production', 'Fishery', 'Financial', 'Census', 'Inventory'];

export default function ReportsContainer() {
  const location = useLocation();
  const { canManage } = getPageAccess(location.pathname);
  const dispatch = useDispatch();
  const { records, isLoaded } = useSelector((state: RootState) => state.reports);

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All Classifications');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // FETCH DATA
  const fetchReports = async (forceRefresh = false) => {
    if (isLoaded && !forceRefresh) return;
    setIsLoading(true);
    try {
      const response = await axios.get('reports');
      dispatch(setReportData(response.data.reports));
    } catch {
      toast.error('Failed to load reports data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [isLoaded]);

  // FILTER
  const filteredReports = records.filter((rep: any) => {
    const matchesSearch =
      rep.title?.toLowerCase().includes(search.toLowerCase()) ||
      rep.generated_by?.toLowerCase().includes(search.toLowerCase()) ||
      rep.module?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'All Classifications' || rep.type === selectedType;
    const repDate = rep.generated_at ? rep.generated_at.split('T')[0] : '';
    const matchesDate = !selectedDate || repDate.startsWith(selectedDate);
    return matchesSearch && matchesType && matchesDate;
  });

  useEffect(() => { setCurrentPage(1); }, [search, selectedType, selectedDate]);

  // METRICS
  const now = new Date();
  const publishedCount = records.filter((r: any) => r.status === 'Published').length;
  const pendingCount = records.filter((r: any) => r.status === 'Pending Review').length;
  const thisMonthCount = records.filter((r: any) => {
    const d = new Date(r.generated_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // DELETE (permanent)
  const handleDelete = async (id: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    Swal.fire({
      title: 'Delete Report?',
      text: 'This report will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete it!',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#ffffff' : '#1e293b',
      customClass: {
        popup: 'rounded-[2.5rem] p-8 border-none shadow-2xl',
        confirmButton: 'rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest',
        cancelButton: 'rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`reports/${id}`);
          dispatch(removeReport(id));
          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
            .fire({ icon: 'success', title: 'Report deleted.' });
        } catch {
          toast.error('Failed to delete report.');
        }
      }
    });
  };

  // DOWNLOAD
  const handleDownload = async (report: any) => {
    if (!report.file_path) {
      toast.error('No file available for this report yet.');
      return;
    }
    try {
      const response = await axios.get(`reports/${report.id}/download`, { responseType: 'blob' });
      const ext = report.format === 'PDF' ? 'pdf' : 'xlsx';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download report.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Documentation & Analytics</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Report <span className="text-primary italic">Archive</span>
          </h2>
        </div>
        {canManage && <button
          onClick={() => setIsGenerateOpen(true)}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer"
        >
          <Plus size={18} /> Generate New Report
        </button>}
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportMetricCard isLoading={isLoading} icon={<FileText />} title="Total Reports" value={records.length.toString()} color="text-primary" bgColor="bg-primary/10" />
        <ReportMetricCard isLoading={isLoading} icon={<ClipboardCheck />} title="Published" value={publishedCount.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <ReportMetricCard isLoading={isLoading} icon={<Clock />} title="Pending Review" value={pendingCount.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
        <ReportMetricCard isLoading={isLoading} icon={<BarChart3 />} title="Generated This Month" value={thisMonthCount.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4">

          {/* SEARCH */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Title, Author, or Module..."
              className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary text-gray-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          {/* TYPE FILTER */}
          <div className="relative shrink-0 w-full md:w-52 lg:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-1 z-50">
                {REPORT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs font-bold uppercase py-3 cursor-pointer">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DATE FILTER */}
          <div className="relative shrink-0 w-full md:w-48">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <input
              type="date"
              className={cn('w-full h-13 pl-12 pr-10 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary cursor-pointer text-gray-700 dark:text-white', !selectedDate && 'text-gray-400')}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full cursor-pointer bg-gray-50 dark:bg-slate-800 z-20">
                <X size={14} />
              </button>
            )}
          </div>

          {/* REFRESH */}
          <button
            onClick={() => fetchReports(true)}
            disabled={isLoading}
            className="shrink-0 flex items-center justify-center gap-2 px-6 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 w-full md:w-auto"
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin text-primary')} />
            <span className={cn(isLoading && 'text-primary cursor-not-allowed')}>
              {isLoading ? 'Refreshing...' : 'Refresh data'}
            </span>
          </button>
        </div>
      </div>

      {/* CHART */}
      <ReportTypeBreakdown reports={filteredReports} isLoading={isLoading} />

      {/* TABLE */}
      <ReportsTable
        reports={filteredReports}
        isLoading={isLoading}
        onView={(r) => { setSelectedReport(r); setIsViewOpen(true); }}
        onDelete={canManage ? handleDelete : undefined}
        onDownload={handleDownload}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
      />

      {/* MODALS */}
      <GenerateReportModal
        isOpen={canManage && isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={(r) => dispatch(addReport(r))}
      />
      <ViewReportModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        report={selectedReport}
        onDownload={handleDownload}
      />
    </div>
  );
}
