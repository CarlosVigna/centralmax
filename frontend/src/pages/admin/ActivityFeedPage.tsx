import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listActivityFeed, type ActivityFeedEntry } from '../../services/activityFeedService';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

const ACTION_ICONS: Record<string, string> = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  STATUS: '🔄',
  TERRITORY_WARNING: '⚠️',
};

const ENTITY_LABELS: Record<string, string> = {
  ORDER: 'Pedido',
  CUSTOMER: 'Cliente',
  PRODUCT: 'Produto',
};

function EntryCard({ entry }: { entry: ActivityFeedEntry }) {
  const icon = ACTION_ICONS[entry.actionType] ?? '📋';
  const entityLabel = ENTITY_LABELS[entry.entityType] ?? entry.entityType;

  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 py-3 last:border-b-0">
      <span className="mt-0.5 text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800">
          <span className="font-semibold">{entry.userName}</span>
          {' '}{entry.actionType === 'CREATE' ? 'criou' : entry.actionType === 'UPDATE' ? 'editou' : entry.actionType === 'DELETE' ? 'excluiu' : 'atualizou'}{' '}
          <span className="text-neutral-500">{entityLabel}</span>
          {entry.entityLabel && (
            <> <span className="font-medium text-neutral-800">{entry.entityLabel}</span></>
          )}
        </p>
        {entry.details && (
          <p className="mt-0.5 text-xs text-neutral-400">{entry.details}</p>
        )}
      </div>
      <span className="shrink-0 text-xs text-neutral-400">{timeAgo(entry.createdAt)}</span>
    </div>
  );
}

export function ActivityFeedPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['activity-feed', page],
    queryFn: () => listActivityFeed(page, 30),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Feed de Atividades</h1>
        <p className="text-sm text-neutral-500">Histórico de ações no sistema</p>
      </div>

      {isLoading && <p className="text-sm text-neutral-500">Carregando...</p>}

      {data && (
        <>
          <div className="rounded-xl border border-neutral-200 bg-white px-4 shadow-sm">
            {data.content.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-400">Nenhuma atividade registrada.</p>
            ) : (
              data.content.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))
            )}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium
                  text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-sm text-neutral-500">
                Página {page + 1} de {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium
                  text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
