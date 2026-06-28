import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useGetMyTicketsQuery } from '../../api/ticketsApi';
import { TicketStatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from '../utils/format';
import type { TicketStatus } from '../../types';

const ACTIVE_STATUSES: TicketStatus[] = ['WaitingForMaster', 'Diagnosis', 'PriceApproval', 'InRepair', 'WaitingForParts', 'ReadyForPickup'];
const HISTORY_STATUSES: TicketStatus[] = ['Completed', 'Cancelled'];

export function RepairsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyTicketsQuery({ page, pageSize: 10 });

  if (isLoading) return <SkeletonList />;

  const statuses = tab === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES;
  const filtered = data?.items.filter((t2) => statuses.includes(t2.status)) ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">{t('repairs.title')}</h1>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/client/repairs/new')}>
          {t('repairs.newRepair')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-card bg-bg p-1 w-fit border border-border">
        {(['active', 'history'] as const).map((t2) => (
          <button key={t2} onClick={() => { setTab(t2); setPage(1); }}
            className={`rounded-btn px-4 py-1.5 text-sm font-medium transition
              ${tab === t2 ? 'bg-surface shadow-card text-navy' : 'text-muted hover:text-text'}`}>
            {t2 === 'active' ? t('repairs.active') : t('repairs.history')}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <EmptyState icon="🔧" title={t('repairs.empty')}
          description={t('repairs.emptyDesc')}
          action={{ label: t('repairs.createTicket'), onClick: () => navigate('/client/repairs/new') }} />
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((ticket) => (
              <button key={ticket.id} onClick={() => navigate(`/client/repairs/${ticket.id}`)}
                className="flex w-full items-center justify-between rounded-card bg-surface p-4 shadow-card hover:shadow-card-lg transition-shadow text-left gap-4">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-text">{ticket.deviceBrand} {ticket.deviceModel}</p>
                  <p className="text-sm text-muted">{ticket.deviceType} · {format.date(ticket.createdAt)}</p>
                  {ticket.masterName && <p className="text-xs text-blue">{t('repairs.master')}: {ticket.masterName}</p>}
                </div>
                <TicketStatusBadge status={ticket.status} />
              </button>
            ))}
          </div>
          <div className="mt-6"><Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} /></div>
        </>
      )}
    </div>
  );
}
