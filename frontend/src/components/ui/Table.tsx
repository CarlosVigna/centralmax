import type { ReactNode } from 'react';

export interface TableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  variant?: 'default' | 'compact';
}

export function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'Nenhum registro encontrado.',
  variant = 'default',
}: TableProps<T>) {
  const cellPadding = variant === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2';

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-600">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-300">
            {columns.map((column) => (
              <th key={column.header} className={`${cellPadding} font-medium text-neutral-600`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'}>
              {columns.map((column) => (
                <td key={column.header} className={cellPadding}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
