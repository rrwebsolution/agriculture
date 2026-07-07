import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../../plugin/axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
  Calendar,
  ChevronsUpDown,
  Copy,
  FlaskConical,
  Leaf,
  Loader2,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Sprout,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getPageAccess } from '../../../lib/permissions';
import { useLocation } from 'react-router-dom';
import PaginationFooter from '../../../components/ui/pagination-footer';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';

const SECTION_LABELS = {
  collection: 'Collection of Scion/Seeds/Seedlings',
  germination: 'Germination of Seeds',
  bagging: 'Soil / Potting Media Bagging',
  production_output: 'Production Output',
} as const;

type SectionKey = keyof typeof SECTION_LABELS;
type BaggingMode = 'mixture' | 'bagging';

const ITEMS_PER_PAGE = 10;

const COLLECTION_TYPES = [
  { value: 'Scion Collection', unit: 'scions' },
  { value: 'Seeds Collection', unit: 'seeds' },
  { value: 'Seedlings Collection', unit: 'seedlings' },
];

const SCION_SPECIES = ['Lemonsito (Grafted)', 'Suha (Grafted)', 'Mango', 'Jackfruit', 'Lime (Grafted)', 'Lanzones', 'Macopa'];
const SEED_SPECIES = ['Guyabano', 'Jackfruit', 'Durian', 'Avocado', 'Macopa', 'Rambutan', 'Mangosteen'];
const GERMINATION_SPECIES = ['Lemonsito (Grafted)', 'Suha (Grafted)', 'Mango', 'Jackfruit', 'Lime (Grafted)', 'Lanzones', 'Macopa'];
const MIXTURE_COMPONENTS = ['Garden Soil', 'Compost / Organic Fertilizer', 'Rice Hull / Carbonized Rice Hull', 'Sand / River Sand'];
const MIXTURE_SPECIFICATIONS = ['Loam, fertile, sieved', 'Well-decomposed, odorless', 'Dry, free from debris', 'Clean, coarse', 'Uniform, well-aerated, well-drained'];
const BAG_SIZE_TYPES = ['Small polybag', 'Medium polybag', 'Large polybag', 'Extra-Large polybag'];
const USED_FOR_OPTIONS = ['Seed germination, small', 'Transplanting, rootstock', 'General seedlings', 'Grafted plants, fruit trees', 'Hardened seedlings', 'Advanced planting stock'];
const SEEDLING_CONDITIONS = ['Healthy', 'Weak', 'Wilted', 'Pest-damaged', 'Diseased', 'Ready for transplant', 'Not yet ready'];

const defaultCollection = {
  record_date: new Date().toISOString().slice(0, 10),
  month: new Date().toISOString().slice(0, 7),
  nursery_site: '',
  collection_type: 'Scion Collection',
  plant_species_variety: '',
  quantity_collected: '',
  remarks: '',
};

const defaultGermination = {
  record_date: new Date().toISOString().slice(0, 10),
  month: new Date().toISOString().slice(0, 7),
  nursery_site: '',
  plant_species_variety: '',
  date_planted: '',
  total_seeds_planted: '',
  date_first_sprout: '',
  total_germinated: '',
  condition_of_seedlings: '',
  remarks: '',
};

const defaultBagging = {
  record_date: new Date().toISOString().slice(0, 10),
  month: new Date().toISOString().slice(0, 7),
  nursery_site: '',
  mode: 'mixture' as BaggingMode,
  component: '',
  specification: '',
  proportion: '',
  source: '',
  cost_per_unit: '',
  bag_size_type: '',
  volume_per_bag: '',
  quantity_bagged: '',
  used_for: '',
  remarks: '',
};

const defaultProductionOutput = {
  record_date: new Date().toISOString().slice(0, 10),
  month: new Date().toISOString().slice(0, 7),
  nursery_site: '',
  plant_species_variety: '',
  seedlings_planted: '',
  transplanted: '',
  mortality: '',
  net_produced: '',
  distributed_issued: '',
  stock_on_hand: '',
  remarks: '',
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const datePart = String(value).split('T')[0].split(' ')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return 'N/A';
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatMonth = (value?: string) => {
  if (!value) return 'N/A';
  const [year, month] = String(value).split('-').map(Number);
  if (!year || !month) return 'N/A';
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const numberValue = (value: any) => Number(value || 0);

const daysBetween = (start?: string, end?: string) => {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '';
  return String(Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000)));
};

const germinationRate = (germinated: any, planted: any) => {
  const total = numberValue(planted);
  if (!total) return '';
  return ((numberValue(germinated) / total) * 100).toFixed(1);
};

export default function NurseryProductionContainer() {
  const location = useLocation();
  const { canManage } = getPageAccess(location.pathname);
  const [activeTab, setActiveTab] = useState<SectionKey>('collection');
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [collectionRows, setCollectionRows] = useState([{ ...defaultCollection }]);
  const [germinationRows, setGerminationRows] = useState([{ ...defaultGermination }]);
  const [baggingRows, setBaggingRows] = useState([{ ...defaultBagging }]);
  const [productionOutputRows, setProductionOutputRows] = useState([{ ...defaultProductionOutput }]);
  const [scionSpeciesOptions, setScionSpeciesOptions] = useState(SCION_SPECIES);
  const [seedSpeciesOptions, setSeedSpeciesOptions] = useState(SEED_SPECIES);
  const [germinationSpeciesOptions, setGerminationSpeciesOptions] = useState(GERMINATION_SPECIES);
  const [componentOptions, setComponentOptions] = useState(MIXTURE_COMPONENTS);
  const [specificationOptions, setSpecificationOptions] = useState(MIXTURE_SPECIFICATIONS);
  const [seedlingConditionOptions, setSeedlingConditionOptions] = useState(SEEDLING_CONDITIONS);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('nursery-records');
      setRecords(response.data?.data || []);
    } catch {
      toast.error('Failed to load City Plant Nursery Production records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const sectionRecords = useMemo(() => {
    const currentSection = SECTION_LABELS[activeTab];
    const query = search.toLowerCase();
    return records.filter((record) => {
      const metadata = record.metadata || {};
      const section = metadata.section || record.activity;
      const text = [record.activity, record.crop_item, record.nursery_site, record.remarks, JSON.stringify(metadata)].join(' ').toLowerCase();
      return section === currentSection && text.includes(query);
    });
  }, [records, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(sectionRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = sectionRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const summary = useMemo(() => {
    const collectionTotal = records
      .filter((record) => record.metadata?.section === SECTION_LABELS.collection)
      .reduce((sum, record) => sum + numberValue(record.quantity), 0);
    const germinatedTotal = records
      .filter((record) => record.metadata?.section === SECTION_LABELS.germination)
      .reduce((sum, record) => sum + numberValue(record.metadata?.total_germinated ?? record.quantity), 0);
    const baggedTotal = records
      .filter((record) => record.metadata?.section === SECTION_LABELS.bagging && record.metadata?.entry_type === 'Bagging Production Record')
      .reduce((sum, record) => sum + numberValue(record.metadata?.quantity_bagged ?? record.quantity), 0);
    const netProducedTotal = records
      .filter((record) => record.metadata?.section === SECTION_LABELS.production_output)
      .reduce((sum, record) => sum + numberValue(record.metadata?.net_produced), 0);

    return { collectionTotal, germinatedTotal, baggedTotal, netProducedTotal };
  }, [records]);

  const postRecord = async (payload: any) => {
    const response = await axios.post('nursery-records', payload);
    setRecords((prev) => [response.data.data, ...prev]);
  };

  const updateCollectionRow = (index: number, patch: Partial<typeof defaultCollection>) => {
    setCollectionRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  };

  const updateGerminationRow = (index: number, patch: Partial<typeof defaultGermination>) => {
    setGerminationRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  };

  const updateBaggingRow = (index: number, patch: Partial<typeof defaultBagging>) => {
    setBaggingRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  };

  const updateProductionOutputRow = (index: number, patch: Partial<typeof defaultProductionOutput>) => {
    setProductionOutputRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  };

  const duplicateLatestCollection = () => setCollectionRows((prev) => [...prev, { ...prev[prev.length - 1] }]);
  const duplicateLatestGermination = () => setGerminationRows((prev) => [...prev, { ...prev[prev.length - 1] }]);
  const duplicateLatestBagging = () => setBaggingRows((prev) => [...prev, { ...prev[prev.length - 1] }]);
  const duplicateLatestProductionOutput = () => setProductionOutputRows((prev) => [...prev, { ...prev[prev.length - 1] }]);
  const removeCollectionRow = (index: number) => setCollectionRows((prev) => prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index));
  const removeGerminationRow = (index: number) => setGerminationRows((prev) => prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index));
  const removeBaggingRow = (index: number) => setBaggingRows((prev) => prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index));
  const removeProductionOutputRow = (index: number) => setProductionOutputRows((prev) => prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index));

  const addCustomOption = async (label: string, options: string[], setOptions: React.Dispatch<React.SetStateAction<string[]>>, onSelect: (value: string) => void) => {
    const result = await Swal.fire({
      title: `Add ${label}`,
      input: 'text',
      inputPlaceholder: `Enter ${label.toLowerCase()}...`,
      showCancelButton: true,
      confirmButtonText: 'Add',
      confirmButtonColor: '#16a34a',
      inputValidator: (value) => !value?.trim() ? `${label} is required` : null,
    });
    const value = String(result.value || '').trim();
    if (!result.isConfirmed || !value) return;

    const existing = options.find((option) => option.toLowerCase() === value.toLowerCase());
    const nextValue = existing || value;
    if (!existing) setOptions((prev) => [...prev, value]);
    onSelect(nextValue);
  };

  const handleCollectionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const filledRows = collectionRows.filter((row) => row.plant_species_variety && row.quantity_collected);
    if (!filledRows.length) {
      toast.error('Please add at least one collection row with plant species and quantity collected.');
      return;
    }
    setIsSaving(true);
    try {
      for (const row of filledRows) {
        const type = COLLECTION_TYPES.find((item) => item.value === row.collection_type) || COLLECTION_TYPES[0];
        await postRecord({
          record_date: row.record_date,
          activity: row.collection_type,
          crop_item: row.plant_species_variety,
          quantity: row.quantity_collected,
          unit: type.unit,
          nursery_site: row.nursery_site,
          remarks: row.remarks,
          metadata: {
            section: SECTION_LABELS.collection,
            month: row.month,
            category: row.collection_type.replace(' Collection', ''),
            plant_species_variety: row.plant_species_variety,
            quantity_collected: row.quantity_collected,
          },
        });
      }
      setCollectionRows([{ ...defaultCollection, nursery_site: filledRows[0].nursery_site }]);
      toast.success(`${filledRows.length} collection record${filledRows.length > 1 ? 's' : ''} saved.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to save collection record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGerminationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const filledRows = germinationRows.filter((row) => row.plant_species_variety && row.total_seeds_planted);
    if (!filledRows.length) {
      toast.error('Please add at least one germination row with plant species and total seeds.');
      return;
    }
    setIsSaving(true);
    try {
      for (const row of filledRows) {
        const days = daysBetween(row.date_planted, row.date_first_sprout);
        const rate = germinationRate(row.total_germinated, row.total_seeds_planted);
        await postRecord({
          record_date: row.record_date,
          activity: 'Germination Record',
          crop_item: row.plant_species_variety,
          quantity: row.total_germinated || 0,
          unit: 'seeds',
          nursery_site: row.nursery_site,
          remarks: row.remarks,
          metadata: {
            section: SECTION_LABELS.germination,
            month: row.month,
            plant_species_variety: row.plant_species_variety,
            date_planted: row.date_planted,
            total_seeds_planted: row.total_seeds_planted,
            date_first_sprout: row.date_first_sprout,
            days_to_germinate: days,
            total_germinated: row.total_germinated,
            germination_rate: rate,
            condition_of_seedlings: row.condition_of_seedlings,
          },
        });
      }
      setGerminationRows([{ ...defaultGermination, nursery_site: filledRows[0].nursery_site }]);
      toast.success(`${filledRows.length} germination record${filledRows.length > 1 ? 's' : ''} saved.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to save germination record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBaggingSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const filledRows = baggingRows.filter((row) => (
      row.mode === 'mixture'
        ? !!row.component
        : !!row.bag_size_type && !!row.quantity_bagged
    ));
    if (!filledRows.length) {
      toast.error('Please add at least one valid soil / potting media bagging row.');
      return;
    }
    setIsSaving(true);
    try {
      for (const row of filledRows) {
        const isMixture = row.mode === 'mixture';
        await postRecord({
          record_date: row.record_date,
          activity: isMixture ? 'Mixture Composition' : 'Bagging Production Record',
          crop_item: isMixture ? row.component : row.bag_size_type,
          quantity: isMixture ? (row.cost_per_unit || 0) : row.quantity_bagged,
          unit: isMixture ? 'php' : 'pcs',
          nursery_site: row.nursery_site,
          remarks: row.remarks,
          metadata: isMixture ? {
            section: SECTION_LABELS.bagging,
            entry_type: 'Mixture Composition',
            month: row.month,
            component: row.component,
            specification: row.specification,
            proportion: row.proportion,
            source: row.source,
            cost_per_unit: row.cost_per_unit,
          } : {
            section: SECTION_LABELS.bagging,
            entry_type: 'Bagging Production Record',
            month: row.month,
            bag_size_type: row.bag_size_type,
            volume_per_bag: row.volume_per_bag,
            quantity_bagged: row.quantity_bagged,
            used_for: row.used_for,
          },
        });
      }
      setBaggingRows([{ ...defaultBagging, nursery_site: filledRows[0].nursery_site, mode: filledRows[0].mode }]);
      toast.success(`${filledRows.length} soil / potting media record${filledRows.length > 1 ? 's' : ''} saved.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to save bagging record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductionOutputSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const filledRows = productionOutputRows.filter((row) => row.plant_species_variety);
    if (!filledRows.length) {
      toast.error('Please add at least one production output row with plant species / variety.');
      return;
    }
    setIsSaving(true);
    try {
      for (const row of filledRows) {
        await postRecord({
          record_date: row.record_date,
          activity: 'Production Output',
          crop_item: row.plant_species_variety,
          quantity: row.stock_on_hand || 0,
          unit: 'seedlings',
          nursery_site: row.nursery_site,
          remarks: row.remarks,
          metadata: {
            section: SECTION_LABELS.production_output,
            month: row.month,
            plant_species_variety: row.plant_species_variety,
            seedlings_planted: row.seedlings_planted,
            transplanted: row.transplanted,
            mortality: row.mortality,
            net_produced: row.net_produced,
            distributed_issued: row.distributed_issued,
            stock_on_hand: row.stock_on_hand,
          },
        });
      }
      setProductionOutputRows([{ ...defaultProductionOutput, nursery_site: filledRows[0].nursery_site }]);
      toast.success(`${filledRows.length} production output record${filledRows.length > 1 ? 's' : ''} saved.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to save production output record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (record: any) => {
    const result = await Swal.fire({
      title: 'Delete record?',
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
      toast.success('Record deleted.');
    } catch {
      toast.error('Unable to delete record.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Sprout size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Production Encoding</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-800 dark:text-white">
            City Plant Nursery <span className="text-primary italic">Production</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 mt-2 max-w-3xl">
            Encode collection, germination, soil / potting media bagging, and production output records here.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRecords}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300 disabled:opacity-50"
        >
          <RefreshCw size={15} className={cn(isLoading && 'animate-spin text-primary')} />
          {isLoading ? 'Refreshing...' : 'Refresh data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric icon={<Leaf size={20} />} title="Collected" value={summary.collectionTotal.toLocaleString()} detail="Scion / Seeds / Seedlings" />
        <Metric icon={<FlaskConical size={20} />} title="Germinated" value={summary.germinatedTotal.toLocaleString()} detail="Total germinated" />
        <Metric icon={<Package size={20} />} title="Bagged Media" value={summary.baggedTotal.toLocaleString()} detail="Prepared bags" />
        <Metric icon={<PackageCheck size={20} />} title="Net Produced" value={summary.netProducedTotal.toLocaleString()} detail="Production output" />
      </div>

      <div className="border-b border-gray-200 dark:border-slate-800">
        <div className="relative overflow-x-auto custom-scrollbar scrollbar-hide">
          <div className="flex items-center gap-8 px-2 min-w-max">
            {([
              ['collection', Leaf],
              ['germination', FlaskConical],
              ['bagging', Package],
              ['production_output', PackageCheck],
            ] as Array<[SectionKey, any]>).map(([tab, Icon]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'relative inline-flex items-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest transition-colors',
                  activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-200'
                )}
              >
                <span className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center border transition-colors',
                  activeTab === tab
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'
                )}>
                  <Icon size={15} />
                </span>
                {SECTION_LABELS[tab]}
                {activeTab === tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {canManage && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm p-5 sm:p-6 max-h-[720px] flex flex-col overflow-hidden">
          {activeTab === 'collection' && (
            <form onSubmit={handleCollectionSubmit} className="min-h-0 flex flex-col gap-5">
              <FormHeader icon={<Leaf />} title="Collection of Scion / Seeds / Seedlings" />
              <div className="min-h-0 max-h-[520px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                {collectionRows.map((row, index) => (
                  <div key={index} className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-4">
                    <EntryHeader index={index} canDelete={collectionRows.length > 1} onDelete={() => removeCollectionRow(index)} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Month" type="month" value={row.month} onChange={(v) => updateCollectionRow(index, { month: v })} />
                      <CommandSelect label="Collection Type" value={row.collection_type} onChange={(v) => updateCollectionRow(index, { collection_type: v, plant_species_variety: '' })} options={COLLECTION_TYPES.map((item) => item.value)} searchPlaceholder="Search collection type..." />
                      <CommandSelect
                        label="Plant Species / Variety"
                        value={row.plant_species_variety}
                        onChange={(v) => updateCollectionRow(index, { plant_species_variety: v })}
                        options={row.collection_type === 'Scion Collection' ? scionSpeciesOptions : seedSpeciesOptions}
                        searchPlaceholder="Search plant species..."
                        addLabel="Add Plant Species"
                        onAdd={() => addCustomOption(
                          'Plant Species / Variety',
                          row.collection_type === 'Scion Collection' ? scionSpeciesOptions : seedSpeciesOptions,
                          row.collection_type === 'Scion Collection' ? setScionSpeciesOptions : setSeedSpeciesOptions,
                          (value) => updateCollectionRow(index, { plant_species_variety: value })
                        )}
                      />
                      <Input label="Quantity Collected" type="number" value={row.quantity_collected} onChange={(v) => updateCollectionRow(index, { quantity_collected: v })} placeholder="e.g. 1200" />
                    </div>
                  </div>
                ))}
              </div>
              <FormActions
                isSaving={isSaving}
                onAdd={() => setCollectionRows((prev) => [...prev, { ...defaultCollection, nursery_site: prev[prev.length - 1]?.nursery_site || '' }])}
                onDuplicate={duplicateLatestCollection}
              />
            </form>
          )}

          {activeTab === 'germination' && (
            <form onSubmit={handleGerminationSubmit} className="min-h-0 flex flex-col gap-5">
              <FormHeader icon={<FlaskConical />} title="Germination of Seeds" />
              <div className="min-h-0 max-h-[520px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                {germinationRows.map((row, index) => (
                  <div key={index} className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-4">
                    <EntryHeader index={index} canDelete={germinationRows.length > 1} onDelete={() => removeGerminationRow(index)} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Month" type="month" value={row.month} onChange={(v) => updateGerminationRow(index, { month: v })} />
                      <CommandSelect
                        label="Plant Species / Variety"
                        value={row.plant_species_variety}
                        onChange={(v) => updateGerminationRow(index, { plant_species_variety: v })}
                        options={germinationSpeciesOptions}
                        searchPlaceholder="Search plant species..."
                        addLabel="Add Plant Species"
                        onAdd={() => addCustomOption('Plant Species / Variety', germinationSpeciesOptions, setGerminationSpeciesOptions, (value) => updateGerminationRow(index, { plant_species_variety: value }))}
                      />
                      <Input label="Date Sown / Planted" type="date" value={row.date_planted} onChange={(v) => updateGerminationRow(index, { date_planted: v })} />
                      <Input label="Total Seeds Sown / Planted" type="number" value={row.total_seeds_planted} onChange={(v) => updateGerminationRow(index, { total_seeds_planted: v })} placeholder="e.g. 3050" />
                      <Input label="Date First Sprout" type="date" value={row.date_first_sprout} onChange={(v) => updateGerminationRow(index, { date_first_sprout: v })} />
                      <Readonly label="Days to Germinate" value={daysBetween(row.date_planted, row.date_first_sprout) || 'Auto'} />
                      <Input label="Total Germinated" type="number" value={row.total_germinated} onChange={(v) => updateGerminationRow(index, { total_germinated: v })} placeholder="e.g. 2658" />
                      <Readonly label="Germination Rate (%)" value={germinationRate(row.total_germinated, row.total_seeds_planted) || 'Auto'} />
                      <CommandSelect
                        label="Condition of Seedlings"
                        value={row.condition_of_seedlings}
                        onChange={(v) => updateGerminationRow(index, { condition_of_seedlings: v })}
                        options={seedlingConditionOptions}
                        searchPlaceholder="Search condition..."
                        addLabel="Add Custom Status"
                        onAdd={() => addCustomOption('Condition of Seedlings', seedlingConditionOptions, setSeedlingConditionOptions, (value) => updateGerminationRow(index, { condition_of_seedlings: value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <FormActions
                isSaving={isSaving}
                onAdd={() => setGerminationRows((prev) => [...prev, { ...defaultGermination, nursery_site: prev[prev.length - 1]?.nursery_site || '' }])}
                onDuplicate={duplicateLatestGermination}
              />
            </form>
          )}

          {activeTab === 'bagging' && (
            <form onSubmit={handleBaggingSubmit} className="min-h-0 flex flex-col gap-5">
              <FormHeader icon={<Package />} title="Soil / Potting Media Bagging" />
              <div className="min-h-0 max-h-[520px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                {baggingRows.map((row, index) => (
                  <div key={index} className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <EntryHeader index={index} canDelete={baggingRows.length > 1} onDelete={() => removeBaggingRow(index)} />
                      <div className="flex flex-wrap gap-2">
                        {(['mixture', 'bagging'] as BaggingMode[]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => updateBaggingRow(index, { mode })}
                            className={cn(
                              'h-10 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest',
                              row.mode === mode ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-slate-800 text-gray-500'
                            )}
                          >
                            {mode === 'mixture' ? 'Mixture Composition' : 'Bagging Production Record'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Month" type="month" value={row.month} onChange={(v) => updateBaggingRow(index, { month: v })} />
                      {row.mode === 'mixture' ? (
                        <>
                          <CommandSelect
                            label="Component"
                            value={row.component}
                            onChange={(v) => updateBaggingRow(index, { component: v })}
                            options={componentOptions}
                            searchPlaceholder="Search component..."
                            addLabel="Add Component"
                            onAdd={() => addCustomOption('Component', componentOptions, setComponentOptions, (value) => updateBaggingRow(index, { component: value }))}
                          />
                          <CommandSelect
                            label="Specification"
                            value={row.specification}
                            onChange={(v) => updateBaggingRow(index, { specification: v })}
                            options={specificationOptions}
                            searchPlaceholder="Search specification..."
                            addLabel="Add Specification"
                            onAdd={() => addCustomOption('Specification', specificationOptions, setSpecificationOptions, (value) => updateBaggingRow(index, { specification: value }))}
                          />
                          <Input label="Proportion" value={row.proportion} onChange={(v) => updateBaggingRow(index, { proportion: v })} placeholder="e.g. 50%" />
                          <Input label="Source" value={row.source} onChange={(v) => updateBaggingRow(index, { source: v })} />
                          <Input label="Cost per Unit (PHP)" type="number" value={row.cost_per_unit} onChange={(v) => updateBaggingRow(index, { cost_per_unit: v })} placeholder="e.g. 25.00" />
                        </>
                      ) : (
                        <>
                          <Select label="Bag Size / Type" value={row.bag_size_type} onChange={(v) => updateBaggingRow(index, { bag_size_type: v })} options={BAG_SIZE_TYPES} allowCustom />
                          <Input label="Volume per Bag" value={row.volume_per_bag} onChange={(v) => updateBaggingRow(index, { volume_per_bag: v })} placeholder="e.g. 0.5 kg" />
                          <Input label="Quantity Bagged" type="number" value={row.quantity_bagged} onChange={(v) => updateBaggingRow(index, { quantity_bagged: v })} placeholder="e.g. 1200" />
                          <Select label="Used For" value={row.used_for} onChange={(v) => updateBaggingRow(index, { used_for: v })} options={USED_FOR_OPTIONS} allowCustom />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <FormActions
                isSaving={isSaving}
                onAdd={() => setBaggingRows((prev) => [...prev, { ...defaultBagging, nursery_site: prev[prev.length - 1]?.nursery_site || '', mode: prev[prev.length - 1]?.mode || 'mixture' }])}
                onDuplicate={duplicateLatestBagging}
              />
            </form>
          )}

          {activeTab === 'production_output' && (
            <form onSubmit={handleProductionOutputSubmit} className="min-h-0 flex flex-col gap-5">
              <FormHeader icon={<PackageCheck />} title="Production Output" />
              <div className="min-h-0 max-h-[520px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                {productionOutputRows.map((row, index) => (
                  <div key={index} className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-4">
                    <EntryHeader index={index} canDelete={productionOutputRows.length > 1} onDelete={() => removeProductionOutputRow(index)} />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input label="Month" type="month" value={row.month} onChange={(v) => updateProductionOutputRow(index, { month: v })} />
                      <CommandSelect
                        label="Plant Species / Variety"
                        value={row.plant_species_variety}
                        onChange={(v) => updateProductionOutputRow(index, { plant_species_variety: v })}
                        options={germinationSpeciesOptions}
                        searchPlaceholder="Search plant species..."
                        addLabel="Add Plant Species"
                        onAdd={() => addCustomOption('Plant Species / Variety', germinationSpeciesOptions, setGerminationSpeciesOptions, (value) => updateProductionOutputRow(index, { plant_species_variety: value }))}
                      />
                      <Input label="Seedlings Planted" type="number" value={row.seedlings_planted} onChange={(v) => updateProductionOutputRow(index, { seedlings_planted: v })} placeholder="e.g. 3050" />
                      <Input label="Transplanted" type="number" value={row.transplanted} onChange={(v) => updateProductionOutputRow(index, { transplanted: v })} placeholder="e.g. 1200" />
                      <Input label="Mortality" type="number" value={row.mortality} onChange={(v) => updateProductionOutputRow(index, { mortality: v })} placeholder="e.g. 50" />
                      <Input label="Net Produced" type="number" value={row.net_produced} onChange={(v) => updateProductionOutputRow(index, { net_produced: v })} placeholder="e.g. 2800" />
                      <Input label="Distributed / Issued" type="number" value={row.distributed_issued} onChange={(v) => updateProductionOutputRow(index, { distributed_issued: v })} placeholder="e.g. 500" />
                      <Input label="Stock on Hand" type="number" value={row.stock_on_hand} onChange={(v) => updateProductionOutputRow(index, { stock_on_hand: v })} placeholder="e.g. 2500" />
                    </div>
                  </div>
                ))}
              </div>
              <FormActions
                isSaving={isSaving}
                onAdd={() => setProductionOutputRows((prev) => [...prev, { ...defaultProductionOutput, nursery_site: prev[prev.length - 1]?.nursery_site || '' }])}
                onDuplicate={duplicateLatestProductionOutput}
              />
            </form>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Encoded Records</p>
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-800 dark:text-white">{SECTION_LABELS[activeTab]}</h2>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-11 pl-11 pr-10 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-xs font-bold outline-none focus:border-primary"
              placeholder="Search records..."
            />
            {search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/70 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Record</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">Quantity / Value</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-black uppercase text-gray-400"><Loader2 className="inline mr-2 animate-spin" size={16} />Loading records...</td></tr>
              ) : sectionRecords.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-black uppercase text-gray-400">No records found</td></tr>
              ) : paginatedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-slate-300"><Calendar size={13} className="inline mr-2 text-primary" />{formatDate(record.record_date)}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{formatMonth(record.metadata?.month)}</td>
                  <td className="px-6 py-4"><p className="text-xs font-black text-gray-800 dark:text-white uppercase">{record.activity}</p><p className="text-[10px] font-bold text-gray-400">{record.crop_item}</p></td>
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 max-w-md">{recordDetail(record)}</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-gray-800 dark:text-white">{Number(record.quantity || 0).toLocaleString()} {record.unit}</td>
                  <td className="px-6 py-4 text-right">
                    {canManage && <button type="button" onClick={() => handleDelete(record)} className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={15} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter
          shownCount={paginatedRecords.length}
          totalCount={sectionRecords.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          label="Records"
        />
      </div>
    </div>
  );
}

function recordDetail(record: any) {
  const meta = record.metadata || {};
  if (meta.section === SECTION_LABELS.collection) return `${meta.category || 'Collection'} - ${meta.plant_species_variety || record.crop_item}`;
  if (meta.section === SECTION_LABELS.germination) return `Sown: ${meta.total_seeds_planted || 0}, germinated: ${meta.total_germinated || 0}, rate: ${meta.germination_rate || 0}%`;
  if (meta.section === SECTION_LABELS.production_output) return `Planted: ${meta.seedlings_planted || 0}, Transplanted: ${meta.transplanted || 0}, Mortality: ${meta.mortality || 0}, Net: ${meta.net_produced || 0}, Distributed: ${meta.distributed_issued || 0}`;
  if (meta.entry_type === 'Mixture Composition') return `${meta.specification || 'No specification'} | ${meta.proportion || 'No proportion'} | ${meta.source || 'No source'}`;
  if (meta.entry_type === 'Bagging Production Record') return `${meta.volume_per_bag || 'No volume'} | ${meta.used_for || 'No use specified'}`;
  return record.remarks || 'No details';
}

function Metric({ icon, title, value, detail }: { icon: React.ReactNode; title: string; value: string; detail: string }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] shadow-sm h-28 flex items-center gap-4">
      <div className="p-4 rounded-2xl bg-primary/10 text-primary shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 truncate">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none mt-1 truncate">{value}</h3>
        <p className="text-[10px] font-bold text-gray-400 mt-2 truncate">{detail}</p>
      </div>
    </div>
  );
}

function FormHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">{icon}<span>{title}</span></div>;
}

function EntryHeader({ index, canDelete, onDelete }: { index: number; canDelete: boolean; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Entry #{index + 1}</p>
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20"
        >
          <Trash2 size={13} />
          Delete
        </button>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full h-11 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary" />
    </label>
  );
}

function Readonly({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</span>
      <div className="w-full h-11 rounded-2xl bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 px-4 flex items-center text-xs font-black text-gray-500 dark:text-slate-300">{value}</div>
    </label>
  );
}

function Select({ label, value, onChange, options, allowCustom = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; allowCustom?: boolean }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</span>
      <input list={`${label.replace(/\s+/g, '-')}-options`} value={value} onChange={(event) => onChange(event.target.value)} className="w-full h-11 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-xs font-bold outline-none focus:border-primary" placeholder={allowCustom ? 'Select or type custom...' : 'Select...'} />
      <datalist id={`${label.replace(/\s+/g, '-')}-options`}>
        {options.map((option) => <option key={option} value={option} />)}
      </datalist>
    </label>
  );
}

function CommandSelect({
  label,
  value,
  onChange,
  options,
  searchPlaceholder = 'Search...',
  addLabel,
  onAdd,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  searchPlaceholder?: string;
  addLabel?: string;
  onAdd?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <label className="space-y-1.5">
      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full h-11 flex items-center justify-between gap-2 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 text-left text-xs font-bold outline-none hover:border-primary/40 transition-all"
          >
            <span className={cn('truncate uppercase', value ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 normal-case')}>
              {value || 'Select...'}
            </span>
            <ChevronsUpDown size={15} className="text-gray-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-[150] border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-11 text-xs font-bold border-none focus:ring-0" />
            <CommandList className="max-h-60 custom-scrollbar p-1">
              <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer"
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
              {onAdd && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onAdd();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                    {addLabel || 'Add Custom Entry'}
                  </button>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </label>
  );
}

function FormActions({ isSaving, onAdd, onDuplicate }: { isSaving: boolean; onAdd: () => void; onDuplicate: () => void }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onAdd} disabled={isSaving} className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-primary disabled:opacity-60">
        <Plus size={15} />
        Add
      </button>
      <button type="button" onClick={onDuplicate} disabled={isSaving} className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-primary disabled:opacity-60">
        <Copy size={15} />
        Duplicate
      </button>
      <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-60">
        {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        Save Records
      </button>
    </div>
  );
}
