import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';

type CommandFilterOption = string | { value: string; label: string };

type CommandFilterProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CommandFilterOption[];
  className?: string;
  triggerClassName?: string;
};

export function CommandFilter({
  label,
  value,
  onChange,
  options,
  className,
  triggerClassName,
}: CommandFilterProps) {
  const [open, setOpen] = useState(false);
  const normalizedOptions = options.map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));
  const selectedLabel = normalizedOptions.find((option) => option.value === value)?.label || value;

  return (
    <div className={cn('w-full sm:w-auto', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full sm:w-56 h-13 px-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-black outline-none flex items-center justify-between cursor-pointer data-[state=open]:ring-2 data-[state=open]:ring-primary transition-all',
              triggerClassName
            )}
          >
            <span className="min-w-0 flex flex-col items-start leading-none">
              <span className="mb-1 text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
              <span className="max-w-full truncate text-gray-700 dark:text-slate-200">{selectedLabel}</span>
            </span>
            <ChevronsUpDown size={16} className="text-gray-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-64 bg-white dark:bg-slate-900 rounded-2xl z-50 border border-gray-100 dark:border-slate-800 shadow-2xl">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="h-11 text-xs font-bold" />
            <CommandList className="max-h-60 custom-scrollbar">
              <CommandEmpty className="py-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">No match found.</CommandEmpty>
              <CommandGroup>
                {normalizedOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="text-xs font-bold py-3 px-3 rounded-xl cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate pr-3">{option.label}</span>
                    <Check size={14} className={cn('text-primary transition-opacity', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
