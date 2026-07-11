import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { getDeliveryRoute } from '../../services/deliveryRouteService';
import type { DeliveryRouteStop } from '../../services/deliveryRouteService';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildWhatsAppUrl(phone: string, customerName: string, orderNumber: string): string {
  const msg = `Olá ${customerName}! Seu pedido #${orderNumber} está a caminho. Em breve chegaremos!`;
  const clean = phone.replace(/\D/g, '');
  const br = clean.startsWith('55') ? clean : `55${clean}`;
  return `https://api.whatsapp.com/send?phone=${br}&text=${encodeURIComponent(msg)}`;
}

function buildMapsUrl(stops: DeliveryRouteStop[]): string | null {
  const withAddr = stops.filter((s) => s.fullAddress);
  if (withAddr.length === 0) return null;
  const addrs = withAddr.map((s) => encodeURIComponent(s.fullAddress!));
  return `https://www.google.com/maps/dir/${addrs.join('/')}`;
}

function groupByNeighborhood(stops: DeliveryRouteStop[]): { neighborhood: string; stops: DeliveryRouteStop[] }[] {
  const map = new Map<string, DeliveryRouteStop[]>();
  for (const stop of stops) {
    const key = stop.neighborhood ?? '(Sem bairro)';
    const arr = map.get(key) ?? [];
    arr.push(stop);
    map.set(key, arr);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === '(Sem bairro)') return 1;
      if (b === '(Sem bairro)') return -1;
      return a.localeCompare(b, 'pt-BR');
    })
    .map(([neighborhood, stops]) => ({ neighborhood, stops }));
}

export function DeliveryRoutePage() {
  const [date, setDate] = useState(todayIso());
  const [fetch, setFetch] = useState(false);
  const [groupByNeigh, setGroupByNeigh] = useState(false);

  const { data, isFetching, isError } = useQuery({
    queryKey: ['delivery-route', date],
    queryFn: () => getDeliveryRoute(date, ['SAIU_ENTREGA']),
    enabled: fetch,
  });

  function handleGenerate() {
    setFetch(true);
  }

  const grouped = data && groupByNeigh ? groupByNeighborhood(data.stops) : null;
  const orderedStops = grouped ? grouped.flatMap((g) => g.stops) : data?.stops ?? [];
  const mapsUrl = grouped ? buildMapsUrl(orderedStops) : data?.googleMapsUrl ?? null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Rota de Entrega</h1>
          <p className="text-sm text-neutral-500">Pedidos com status "Saiu p/ Entrega"</p>
        </div>
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Button>Abrir Rota no Google Maps</Button>
          </a>
        )}
      </div>

      {/* Filtro de data */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setFetch(false); }}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <Button disabled={isFetching} onClick={handleGenerate}>
          {isFetching ? 'Carregando...' : 'Ver rota'}
        </Button>
        {data && data.stops.length > 0 && (
          <button
            onClick={() => setGroupByNeigh((v) => !v)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              groupByNeigh
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {groupByNeigh ? '✓ ' : ''}Agrupar por bairro
          </button>
        )}
      </div>

      {isError && (
        <p className="mb-4 text-sm text-danger">Erro ao carregar rota de entrega.</p>
      )}

      {data && (
        <>
          {data.stops.length === 0 ? (
            <p className="text-sm text-neutral-600">
              Nenhum pedido com status "Saiu p/ Entrega" encontrado para{' '}
              {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}.
            </p>
          ) : (
            <>
              {data.stops.some((s) => !s.fullAddress) && (
                <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Atenção: {data.stops.filter((s) => !s.fullAddress).length} parada(s) sem endereço cadastrado e não serão incluídas na rota do Google Maps.
                </div>
              )}

              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium text-neutral-600">#</th>
                      <th className="px-3 py-2 font-medium text-neutral-600">Pedido</th>
                      <th className="px-3 py-2 font-medium text-neutral-600">Cliente</th>
                      <th className="px-3 py-2 font-medium text-neutral-600">Endereço</th>
                      <th className="px-3 py-2 font-medium text-neutral-600">Itens</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {grouped ? (
                      grouped.map((group) => (
                        <Fragment key={`group-${group.neighborhood}`}>
                          <tr className="bg-blue-50">
                            <td colSpan={6} className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                              {group.neighborhood} ({group.stops.length})
                            </td>
                          </tr>
                          {group.stops.map((stop) => {
                            const globalIdx = orderedStops.indexOf(stop);
                            return (
                              <tr key={stop.orderNumber} className={!stop.fullAddress ? 'bg-amber-50' : ''}>
                                <td className="px-3 py-2 text-neutral-500">{globalIdx + 1}</td>
                                <td className="px-3 py-2 font-mono font-semibold text-neutral-900">
                                  #{stop.orderNumber}
                                </td>
                                <td className="px-3 py-2">
                                  <p className="font-medium text-neutral-900">{stop.customerName}</p>
                                  {stop.phone && (
                                    <p className="text-xs text-neutral-500">{stop.phone}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm text-neutral-700">
                                  {stop.address ?? (
                                    <span className="text-amber-600 text-xs">Sem endereço</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-xs text-neutral-600 max-w-[200px]">
                                  {stop.items}
                                </td>
                                <td className="px-3 py-2">
                                  {stop.phone ? (
                                    <a href={buildWhatsAppUrl(stop.phone, stop.customerName, stop.orderNumber)}
                                      target="_blank" rel="noreferrer">
                                      <Button size="sm" variant="ghost">💬</Button>
                                    </a>
                                  ) : (
                                    <Button size="sm" variant="ghost" disabled title="Sem telefone">💬</Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      ))
                    ) : (
                      data.stops.map((stop, idx) => (
                        <tr key={stop.orderNumber} className={!stop.fullAddress ? 'bg-amber-50' : ''}>
                          <td className="px-3 py-2 text-neutral-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-mono font-semibold text-neutral-900">
                            #{stop.orderNumber}
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-neutral-900">{stop.customerName}</p>
                            {stop.phone && (
                              <p className="text-xs text-neutral-500">{stop.phone}</p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm text-neutral-700">
                            {stop.address ?? (
                              <span className="text-amber-600 text-xs">Sem endereço</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-neutral-600 max-w-[200px]">
                            {stop.items}
                          </td>
                          <td className="px-3 py-2">
                            {stop.phone ? (
                              <a
                                href={buildWhatsAppUrl(stop.phone, stop.customerName, stop.orderNumber)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button size="sm" variant="ghost">💬</Button>
                              </a>
                            ) : (
                              <Button size="sm" variant="ghost" disabled title="Sem telefone">💬</Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {mapsUrl && (
                <div className="mt-4 flex justify-center">
                  <a href={mapsUrl} target="_blank" rel="noreferrer">
                    <Button>Abrir Rota no Google Maps ({orderedStops.filter((s) => s.fullAddress).length} paradas)</Button>
                  </a>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
