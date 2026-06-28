import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetMasterTicketsQuery, useAssignTicketMutation } from '../../api/ticketsApi';
import { TicketStatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from '../utils/format';
import toast from 'react-hot-toast';
import type { TicketStatus } from '../../types';

const ACTIVE_STATUSES: TicketStatus[] = ['WaitingForMaster', 'Diagnosis', 'PriceApproval', 'InRepair', 'WaitingForParts', 'ReadyForPickup'];
const HISTORY_STATUSES: TicketStatus[] = ['Completed', 'Cancelled'];

const DEVICE_ICONS: Record<string, string> = {
  Laptop: '💻', Phone: '📱', Desktop: '🖥️', Tablet: '📱', Printer: '🖨️', Monitor: '🖥️', Console: '🎮', SmartWatch: '⌚',
};

export function MasterDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const { data, isLoading, refetch } = useGetMasterTicketsQuery(
    { page, pageSize: 20 },
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

  const tabStatuses = tab === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES;
  const filtered = data?.items.filter((t) => tabStatuses.includes(t.status as TicketStatus)) ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">{t('master.title')}</h1>
        <button onClick={() => refetch()} className="text-sm text-blue hover:underline">↻ {t('common.update')}</button>
      </div>

      {/* Active / History tabs */}
      <div className="mb-5 flex gap-1 rounded-card bg-bg p-1 w-fit border border-border">
        {(['active', 'history'] as const).map((t2) => (
          <button key={t2} onClick={() => { setTab(t2); setPage(1); }}
            className={`rounded-btn px-4 py-1.5 text-sm font-medium transition
              ${tab === t2 ? 'bg-surface shadow-card text-navy' : 'text-muted hover:text-text'}`}>
            {t2 === 'active' ? t('master.activeTickets') : t('master.history')}
          </button>
        ))}
      </div>

      {isLoading ? <SkeletonList count={6} /> : !filtered.length ? (
        <EmptyState icon="✅" title={t('master.noTickets')} description={t('master.allProcessed')} />
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-bg text-2xl">
                  {DEVICE_ICONS[ticket.deviceType] ?? '🔧'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-text">{ticket.deviceBrand} {ticket.deviceModel}</p>
                  <p className="text-sm text-muted">{ticket.clientName} · {format.date(ticket.createdAt)}</p>
                  <p className="text-xs text-muted line-clamp-1">{ticket.problemDescription}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <TicketStatusBadge status={ticket.status} />
                  {(ticket.status as TicketStatus) === 'WaitingForMaster' && !ticket.masterId ? (
                    <Button size="sm" onClick={() => handleAssign(ticket.id)}>{t('master.take')}</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/master/tickets/${ticket.id}`)}>{t('master.open')}</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6"><Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} /></div>
        </>
      )}
    </div>
  );
}
