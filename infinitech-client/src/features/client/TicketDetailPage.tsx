import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetTicketQuery } from '../../api/ticketsApi';
import { StatusTracker } from '../../components/shared/StatusTracker';
import { TicketStatusBadge } from '../../components/shared/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { format } from '../utils/format';
import type { TicketStatus } from '../../types';

const TERMINAL_STATUSES: TicketStatus[] = ['Completed', 'Cancelled'];

const statusMessages: Partial<Record<TicketStatus, (t: { masterName?: string; diagnosisResult?: string; repairCost?: number }) => string>> = {
  WaitingForMaster: () => 'Ваша заявка принята. Ожидаем назначения мастера.',
  Diagnosis:        (t) => `Мастер ${t.masterName ?? ''} приступил к диагностике.`,
  PriceApproval:    (t) => `Диагноз: ${t.diagnosisResult ?? '—'}. Стоимость: ₼${t.repairCost?.toFixed(2) ?? '—'}.`,
  InRepair:         (t) => `Мастер ${t.masterName ?? ''} выполняет ремонт.`,
  WaitingForParts:  () => 'Ожидаем поступления запчастей.',
  ReadyForPickup:   () => 'Ремонт завершён! Вы можете забрать устройство.',
  Completed:        () => 'Устройство выдано. Спасибо за обращение!',
  Cancelled:        () => 'Заявка отменена.',
};

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pollingInterval, setPollingInterval] = useState(30000);
  const { data: ticket, isLoading } = useGetTicketQuery(id!, { pollingInterval });

  useEffect(() => {
    if (ticket) {
      setLastUpdated(new Date());
      if (TERMINAL_STATUSES.includes(ticket.status)) setPollingInterval(0);
    }
  }, [ticket?.status, ticket?.updatedAt]);

  if (isLoading) return <PageSpinner />;
  if (!ticket) return <div className="text-center py-20 text-muted">Заявка не найдена</div>;

  const msg = statusMessages[ticket.status]?.(ticket) ?? '';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-navy transition">
        <ArrowLeft size={16} /> Назад
      </button>

      <div className="space-y-5">
        {/* Header */}
        <div className="rounded-card bg-surface p-6 shadow-card">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="font-display text-xl font-bold text-text">{ticket.deviceBrand} {ticket.deviceModel}</h1>
              <p className="text-sm text-muted">{ticket.deviceType} · Заявка от {format.date(ticket.createdAt)}</p>
            </div>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <StatusTracker status={ticket.status} />
          {lastUpdated && (
            <p className="mt-3 text-xs text-muted">Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}</p>
          )}
        </div>

        {/* Status message */}
        {msg && (
          <div className="rounded-card bg-blue-xlight border border-blue/20 p-4 text-sm text-navy">
            {msg}
          </div>
        )}

        {/* Details */}
        <div className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="mb-4 font-display text-base font-semibold text-text">Информация об устройстве</h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            {[
              ['Тип', ticket.deviceType],
              ['Бренд', ticket.deviceBrand],
              ['Модель', ticket.deviceModel],
              ['Серийный номер', ticket.serialNumber ?? '—'],
              ['Мастер', ticket.masterName ?? 'Не назначен'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="font-medium text-text">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <dt className="text-xs text-muted">Проблема</dt>
            <dd className="mt-1 text-sm text-text">{ticket.problemDescription}</dd>
          </div>
        </div>

        {/* Photos */}
        {ticket.photos.length > 0 && (
          <div className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="mb-4 font-display text-base font-semibold text-text">Фотографии</h2>
            <div className="flex flex-wrap gap-3">
              {ticket.photos.map((p) => (
                <a key={p.id} href={`/uploads/${p.filePath}`} target="_blank" rel="noopener noreferrer">
                  <img src={`/uploads/${p.filePath}`} alt={p.originalFileName}
                    className="h-20 w-20 rounded-card object-cover border border-border hover:opacity-90 transition" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Public comments */}
        {ticket.comments.filter((c) => !c.isInternal).length > 0 && (
          <div className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="mb-4 font-display text-base font-semibold text-text">Комментарии мастера</h2>
            <div className="space-y-3">
              {ticket.comments.filter((c) => !c.isInternal).map((c) => (
                <div key={c.id} className="rounded-btn bg-bg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-navy">{c.authorName}</span>
                    <span className="text-xs text-muted">{format.dateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
