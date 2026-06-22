import { CommandFilter } from './command-filter';

export type TableSortValue = 'name-asc' | 'name-desc';

export const sortRecordsAlphabetically = <T,>(
  records: T[],
  getLabel: (record: T) => unknown,
  direction: TableSortValue,
) => [...records].sort((a, b) => {
  const result = String(getLabel(a) ?? '').localeCompare(String(getLabel(b) ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  return direction === 'name-desc' ? -result : result;
});

export function TableSortControl({
  value,
  onChange,
}: {
  value: TableSortValue;
  onChange: (value: TableSortValue) => void;
}) {
  return (
    <CommandFilter
      label="Sort"
      value={value}
      onChange={(next) => onChange(next as TableSortValue)}
      options={[
        { value: 'name-asc', label: 'Alphabetical A-Z' },
        { value: 'name-desc', label: 'Alphabetical Z-A' },
      ]}
      className="sm:w-auto"
      triggerClassName="sm:w-52 h-11 bg-white dark:bg-slate-900"
    />
  );
}
