import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAdminTicketsQuery } from '../../api/ticketsApi';
import { TicketStatusBadge } from '../../components/shared/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { format } from '../utils/format';
import type { TicketStatus } from '../../types';

const STATUSES: TicketStatus[] = ['WaitingForMaster', 'Diagnosis', 'PriceApproval', 'InRepair', 'WaitingForParts', 'ReadyForPickup', 'Completed', 'Cancelled'];
const LABELS: Record<TicketStatus, string> = {
  WaitingForMaster: 'Ожидает', Diagnosis: 'Диагностика', PriceApproval: 'Цена',
  InRepair: 'В ремонте', WaitingForParts: 'Запчасти', ReadyForPickup: 'Готово',
  Completed: 'Завершён', Cancelled: 'Отменён',
};

const ACTIVE: TicketStatus[] = ['WaitingForMaster', 'Diagnosis', 'PriceApproval', 'InRepair', 'WaitingForParts', 'ReadyForPickup'];
const HISTORY: TicketStatus[] = ['Completed', 'Cancelled'];

export function AdminTicketsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useGetAdminTicketsQuery({ page, pageSize: 15, status: statusFilter || undefined });

  const tabStatuses = tab === 'active' ? ACTIVE : HISTORY;
  const filteredData = statusFilter
    ? data
    : { ...data, items: data?.items.filter((t) => tabStatuses.includes(t.status)) ?? [] };

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-text">Все заявки на ремонт</h1>

      {/* Active / History tabs */}
      <div className="mb-4 flex gap-1 rounded-card bg-bg p-1 w-fit border border-border">
        {(['active', 'history'] as const).map((t2) => (
          <button key={t2} onClick={() => { setTab(t2); setStatusFilter(''); setPage(1); }}
            className={`rounded-btn px-4 py-1.5 text-sm font-medium transition
              ${tab === t2 ? 'bg-surface shadow-card text-navy' : 'text-muted hover:text-text'}`}>
            {t2 === 'active' ? 'Активные' : 'История'}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('')}
          className={`rounded-chip px-3 py-1 text-sm transition ${statusFilter === '' ? 'bg-navy text-white' : 'bg-surface border border-border text-muted'}`}>
          Все
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-chip px-3 py-1 text-sm transition ${statusFilter === s ? 'bg-navy text-white' : 'bg-surface border border-border text-muted'}`}>
            {LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? <SkeletonList /> : (
        <div className="rounded-card bg-surface shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg">
              <tr>
                {['Устройство', 'Клиент', 'Мастер', 'Дата', 'Статус', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData?.items.map((t) => (
                <tr key={t.id} className="hover:bg-bg transition">
                  <td className="px-4 py-3 font-medium text-text">{t.deviceBrand} {t.deviceModel}</td>
                  <td className="px-4 py-3 text-muted">{t.clientName}</td>
                  <td className="px-4 py-3 text-muted">{t.masterName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{format.date(t.createdAt)}</td>
                  <td className="px-4 py-3"><TicketStatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/admin/tickets/${t.id}`)}
                      className="text-xs font-medium text-blue hover:underline">Открыть</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredData?.items.length && <div className="py-16 text-center text-muted">Заявок нет</div>}
        </div>
      )}
      <div className="mt-6"><Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} /></div>
    </div>
  );
}
