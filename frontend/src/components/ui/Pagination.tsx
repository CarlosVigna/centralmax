interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
}

const SIZE_OPTIONS = [10, 20, 50];

function pageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '...')[] = [];
  if (current <= 3) {
    pages.push(0, 1, 2, 3, 4, '...', total - 1);
  } else if (current >= total - 4) {
    pages.push(0, '...', total - 5, total - 4, total - 3, total - 2, total - 1);
  } else {
    pages.push(0, '...', current - 1, current, current + 1, '...', total - 1);
  }
  return pages;
}

export function Pagination({ page, totalPages, totalElements, size, onPageChange, onSizeChange }: PaginationProps) {
  if (totalPages <= 1 && totalElements <= (SIZE_OPTIONS[0] ?? 10)) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm">
      <p className="text-xs text-neutral-500">
        Exibindo <span className="font-medium">{from}–{to}</span> de{' '}
        <span className="font-medium">{totalElements}</span> resultado(s)
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="rounded border border-neutral-300 px-2.5 py-1 text-xs disabled:opacity-40 hover:bg-neutral-50 transition"
        >
          ← Anterior
        </button>

        {totalPages > 1 && pageRange(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1 text-xs text-neutral-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[2rem] rounded border px-2 py-1 text-xs transition
                ${p === page
                  ? 'border-primary bg-primary font-medium text-white'
                  : 'border-neutral-300 hover:bg-neutral-50'}`}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded border border-neutral-300 px-2.5 py-1 text-xs disabled:opacity-40 hover:bg-neutral-50 transition"
        >
          Próxima →
        </button>
      </div>

      {onSizeChange && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>Itens:</span>
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none"
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
