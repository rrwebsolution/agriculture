import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Table2 } from 'lucide-react';
import axios from '../../../plugin/axios';
import { cn } from '../../../lib/utils';
import { toast } from 'react-toastify';

type PreviewData = {
  headers: string[];
  rows: string[][];
  total?: number;
  summary?: { male_count?: number; female_count?: number };
};

type ReportRecord = {
  id: number;
  title?: string;
  format?: string;
  type?: string;
  module?: string;
  period_from?: string;
  period_to?: string;
  generated_by?: string;
  generated_at?: string;
  notes?: string;
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);
const formatDateShort = (value?: string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
const formatDateTime = (value?: string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function ReportFullPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportId = Number(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!reportId || Number.isNaN(reportId)) {
      setIsLoading(false);
      setIsError(true);
      return;
    }

    let active = true;
    setIsLoading(true);
    setIsError(false);

    Promise.all([
      axios.get(`reports/${reportId}/preview`),
      axios.get('reports'),
    ])
      .then(([previewRes, reportsRes]) => {
        if (!active) return;
        setPreviewData(previewRes.data);
        const records = reportsRes?.data?.reports || [];
        const matched = records.find((r: ReportRecord) => Number(r.id) === reportId) || null;
        setReport(matched);
      })
      .catch(() => {
        if (!active) return;
        setIsError(true);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reportId]);

  const canDownload = useMemo(
    () => !!report && !!previewData && !isLoading && !isError,
    [report, previewData, isLoading, isError]
  );

  const handleDownload = async () => {
    if (!report) return;
    setIsDownloading(true);
    try {
      const response = await axios.get(`reports/${report.id}/download`, { responseType: 'blob' });
      const ext = report.format === 'PDF' ? 'pdf' : 'xlsx';
      const fileName = `${report.title || `report-${report.id}`}.${ext}`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download report.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl border  shadow-sm p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/page/reports-management')}
                className="h-10 w-10 rounded-xl border border-slate-300 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Report Preview</p>
                <h1 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">
                  {report?.title || `Report #${reportId}`}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload || isDownloading}
              className={cn(
                'flex items-center gap-2 px-5 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                canDownload && !isDownloading
                  ? 'bg-primary text-white hover:opacity-90 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              <Download size={14} />
              {isDownloading ? 'Downloading...' : `Download ${report?.format || 'File'}`}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border  shadow-sm p-5 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="text-primary animate-spin" size={28} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading full preview...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-rose-500">Failed to load report preview</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center border-b-2 border-emerald-800 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#2D6A4F]">
                  LGU Gingoog City - Office of the City Agriculturist
                </p>
                <h2 className="mt-1 text-[15px] font-bold uppercase text-slate-900">
                  {report?.title || `Report #${reportId}`}
                </h2>
                <p className="mt-1 text-[10px] text-slate-600">
                  Type: {report?.type || 'N/A'} | Period: {formatDateShort(report?.period_from)} - {formatDateShort(report?.period_to)} | Generated by: {report?.generated_by || 'N/A'} | Date: {formatDateTime(report?.generated_at)}
                </p>
                {report?.notes && (
                  <p className="mt-1 text-[10px] italic text-slate-500">Notes: {report.notes}</p>
                )}
              </div>

              {previewData?.summary && (
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 bg-slate-50 px-3 py-2">
                        <p className="text-[9px] uppercase text-slate-500">Male Count</p>
                        <p className="text-[20px] font-bold text-[#2D6A4F] leading-tight">{previewData.summary.male_count ?? 0}</p>
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-3 py-2">
                        <p className="text-[9px] uppercase text-slate-500">Female Count</p>
                        <p className="text-[20px] font-bold text-[#2D6A4F] leading-tight">{previewData.summary.female_count ?? 0}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {!previewData || previewData.rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                  <Table2 size={32} className="text-slate-300 mb-1" />
                  <p className="text-[11px] italic text-slate-500">No records found for the selected period.</p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#2D6A4F] text-white">
                        {previewData.headers.map((h, i) => (
                          <th key={i} className="px-2 py-2 text-[9px] uppercase tracking-[0.05em] font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, ri) => (
                        <tr key={ri} className="odd:bg-white even:bg-slate-50">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-2 py-2 text-[10px] text-slate-800 border-b ">{cell}</td>
                          ))}
                        </tr>
                      ))}

                      {report?.type === 'Financial' && previewData.total != null && (
                        (previewData.headers?.length || 0) >= 3 ? (
                          <tr className="bg-emerald-50">
                            <td
                              colSpan={(previewData.headers?.length || 1) - 2}
                              className="border-t-2 border-emerald-800 border-b "
                            />
                            <td className="px-2 py-2 text-[10px] font-bold text-slate-900 border-t-2 border-emerald-800 border-b ">TOTAL</td>
                            <td className="px-2 py-2 text-[10px] font-bold text-slate-900 border-t-2 border-emerald-800 border-b ">
                              {formatCurrency(previewData.total)}
                            </td>
                          </tr>
                        ) : (
                          <tr className="bg-emerald-50">
                            <td
                              colSpan={Math.max(previewData.headers?.length || 1, 1)}
                              className="px-2 py-2 text-[10px] font-bold text-slate-900 border-t-2 border-emerald-800 border-b "
                            >
                              TOTAL: {formatCurrency(previewData.total)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-[10px] text-slate-500">Total records: {previewData?.rows?.length || 0}</p>
              <p className="pt-3 border-t  text-[10px] text-slate-500">
                LGU Gingoog City Agriculture Office | Generated: {formatDateTime(new Date().toISOString())}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
