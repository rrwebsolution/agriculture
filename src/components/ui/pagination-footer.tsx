import { cn } from '../../lib/utils';

interface PaginationFooterProps {
  shownCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

// 🌟 Naay siblings ang current page (left/right) + always visible ang first/last,
// naay "…" sa gaps aron dili mag-crowd ang tanang page numbers (e.g. 1-30).
const getVisiblePages = (currentPage: number, totalPages: number, siblingCount = 1): (number | '…')[] => {
  const totalVisible = siblingCount * 2 + 5; // first + last + current + 2 ellipses
  if (totalPages <= totalVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: (number | '…')[] = [1];

  if (showLeftEllipsis) pages.push('…');
  for (let p = Math.max(leftSibling, 2); p <= Math.min(rightSibling, totalPages - 1); p++) {
    pages.push(p);
  }
  if (showRightEllipsis) pages.push('…');

  pages.push(totalPages);
  return pages;
};

const PaginationFooter = ({
  shownCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  label = 'Entries',
  className,
}: PaginationFooterProps) => {
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className={cn('p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0', className)}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Showing {shownCount} of {totalCount} {label}
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer"
        >
          Prev
        </button>

        <div className="flex items-center gap-1">
          {visiblePages.map((pageNum, i) =>
            pageNum === '…' ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-gray-300 dark:text-slate-600 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={pageNum}
                disabled={isLoading}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center',
                  currentPage === pageNum
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30'
                )}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        <button
          disabled={currentPage >= totalPages || totalPages === 0 || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationFooter;
