import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMasterTicketsQuery, useAssignTicketMutation } from '../../api/ticketsApi';
import { TicketStatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from '../utils/format';
import toast from 'react-hot-toast';
import type { TicketStatus } from '../../types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Все', value: '' },
  { label: 'Очередь', value: 'WaitingForMaster' },
  { label: 'В работе', value: 'Diagnosis,InRepair,PriceApproval,WaitingForParts' },
  { label: 'Готово', value: 'ReadyForPickup,Completed' },
];

export function MasterDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, refetch } = useGetMasterTicketsQuery(
    { page, pageSize: 20, status: statusFilter || undefined },
    { pollingInterval: 30000 }
  );
  const [assign] = useAssignTicketMutation();

  const handleAssign = async (id: string) => {
    try {
      const ticket = await assign(id).unwrap();
      toast.success('Заявка взята в работу');
      navigate(`/master/tickets/${ticket.id}`);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error ?? 'Ошибка');
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Панель мастера</h1>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`rounded-chip px-4 py-1.5 text-sm font-medium transition
              ${statusFilter === f.value ? 'bg-navy text-white' : 'bg-surface border border-border text-muted hover:border-navy'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={() => refetch()} className="ml-auto text-sm text-blue hover:underline">Обновить</button>
      </div>

      {isLoading ? <SkeletonList count={6} /> : !data?.items.length ? (
        <EmptyState icon="✅" title="Нет заявок" description="Все заявки обработаны" />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((t) => (
              <div key={t.id} className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-bg text-2xl">
                  {t.deviceType === 'Laptop' ? '💻' : t.deviceType === 'Phone' ? '📱' : t.deviceType === 'Desktop' ? '🖥️' : '🔧'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-text">{t.deviceBrand} {t.deviceModel}</p>
                  <p className="text-sm text-muted">{t.clientName} · {format.date(t.createdAt)}</p>
                  <p className="text-xs text-muted line-clamp-1">{t.problemDescription}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <TicketStatusBadge status={t.status} />
                  {(t.status as TicketStatus) === 'WaitingForMaster' && !t.masterId ? (
                    <Button size="sm" onClick={() => handleAssign(t.id)}>Взять</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/master/tickets/${t.id}`)}>Открыть</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6"><Pagination page={page} totalPages={data.totalPages} onChange={setPage} /></div>
        </>
      )}
    </div>
  );
}
