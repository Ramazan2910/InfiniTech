import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1 <= 5 ? i + 1 : i === 5 ? -1 : totalPages;
    if (page >= totalPages - 3) return i === 0 ? 1 : i === 1 ? -1 : totalPages - 5 + i;
    return i === 0 ? 1 : i === 1 ? -1 : i === 5 ? -2 : i === 6 ? totalPages : page - 2 + (i - 2);
  });

  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="rounded-btn p-2 text-muted hover:bg-blue-xlight disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p < 0 ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            className={`h-8 w-8 rounded-btn text-sm font-medium transition-colors
              ${p === page ? 'bg-blue text-white' : 'text-muted hover:bg-blue-xlight hover:text-navy'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="rounded-btn p-2 text-muted hover:bg-blue-xlight disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
