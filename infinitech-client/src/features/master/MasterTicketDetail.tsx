import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetTicketQuery, useUpdateTicketStatusMutation, useAddCommentMutation } from '../../api/ticketsApi';
import { StatusTracker } from '../../components/shared/StatusTracker';
import { TicketStatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { format } from '../utils/format';
import toast from 'react-hot-toast';
import type { TicketStatus } from '../../types';

const VALID_TRANSITIONS: Partial<Record<TicketStatus, TicketStatus[]>> = {
  Diagnosis:        ['PriceApproval', 'Cancelled'],
  PriceApproval:    ['InRepair', 'Cancelled'],
  InRepair:         ['WaitingForParts', 'ReadyForPickup', 'Cancelled'],
  WaitingForParts:  ['InRepair', 'Cancelled'],
  ReadyForPickup:   ['Completed'],
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  WaitingForMaster: 'Ожидает мастера', Diagnosis: 'Диагностика', PriceApproval: 'Согласование цены',
  InRepair: 'В ремонте', WaitingForParts: 'Ожидание запчастей', ReadyForPickup: 'Готово к выдаче',
  Completed: 'Завершён', Cancelled: 'Отменён',
};

export function MasterTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading } = useGetTicketQuery(id!);
  const [updateStatus, { isLoading: updating }] = useUpdateTicketStatusMutation();
  const [addComment, { isLoading: commenting }] = useAddCommentMutation();

  const [nextStatus, setNextStatus] = useState<TicketStatus | ''>('');
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  if (isLoading) return <PageSpinner />;
  if (!ticket) return <div className="text-center py-20 text-muted">Заявка не найдена</div>;

  const validNextStatuses = VALID_TRANSITIONS[ticket.status] ?? [];

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    try {
      await updateStatus({
        id: ticket.id,
        status: nextStatus,
        diagnosisResult: diagnosisResult || undefined,
        repairCost: repairCost ? Number(repairCost) : undefined,
      }).unwrap();
      toast.success('Статус обновлён');
      setNextStatus('');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error ?? 'Ошибка обновления статуса');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment({ id: ticket.id, content: comment, isInternal }).unwrap();
      toast.success('Комментарий добавлен');
      setComment('');
    } catch { toast.error('Ошибка'); }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-navy transition">
        <ArrowLeft size={16} /> Назад
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-card bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h1 className="font-display text-xl font-bold text-text">{ticket.deviceBrand} {ticket.deviceModel}</h1>
                <p className="text-sm text-muted">{ticket.clientName} · {ticket.clientEmail}</p>
              </div>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <StatusTracker status={ticket.status} />
          </div>

          <div className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="mb-3 font-display font-semibold text-text">Проблема</h2>
            <p className="text-sm text-text">{ticket.problemDescription}</p>
            {ticket.diagnosisResult && (
              <div className="mt-3">
                <p className="text-xs text-muted">Диагноз</p>
                <p className="text-sm font-medium text-text">{ticket.diagnosisResult}</p>
              </div>
            )}
            {ticket.repairCost !== undefined && ticket.repairCost !== null && (
              <div className="mt-2">
                <p className="text-xs text-muted">Стоимость ремонта</p>
                <p className="text-sm font-bold text-navy">₼{ticket.repairCost.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          {ticket.photos.length > 0 && (
            <div className="rounded-card bg-surface p-6 shadow-card">
              <h2 className="mb-3 font-display font-semibold text-text">Фотографии</h2>
              <div className="flex flex-wrap gap-3">
                {ticket.photos.map((p) => (
                  <a key={p.id} href={`/uploads/${p.filePath}`} target="_blank" rel="noopener noreferrer">
                    <img src={`/uploads/${p.filePath}`} alt={p.originalFileName}
                      className="h-24 w-24 rounded-card object-cover border border-border" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="mb-4 font-display font-semibold text-text">Комментарии</h2>
            <div className="space-y-3 mb-4">
              {ticket.comments.map((c) => (
                <div key={c.id} className={`rounded-btn p-3 ${c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-bg'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-navy">{c.authorName}
                      {c.isInternal && <span className="ml-2 text-[10px] text-warning">[INTERNAL]</span>}
                    </span>
                    <span className="text-xs text-muted">{format.dateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text">{c.content}</p>
                </div>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Написать комментарий..."
              className="w-full rounded-btn border border-border px-3 py-2 text-sm outline-none focus:border-blue resize-none mb-2" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
                Внутренняя заметка
              </label>
              <Button size="sm" loading={commenting} onClick={handleComment}>Отправить</Button>
            </div>
          </div>
        </div>

        {/* Status panel */}
        <div className="space-y-5">
          {validNextStatuses.length > 0 && (
            <div className="rounded-card bg-surface p-6 shadow-card">
              <h2 className="mb-4 font-display font-semibold text-text">Обновить статус</h2>
              <div className="space-y-3">
                <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value as TicketStatus | '')}
                  className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue">
                  <option value="">Выберите статус...</option>
                  {validNextStatuses.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>

                {nextStatus === 'PriceApproval' && (
                  <textarea value={diagnosisResult} onChange={(e) => setDiagnosisResult(e.target.value)}
                    placeholder="Результат диагностики*" rows={3}
                    className="w-full rounded-btn border border-border px-3 py-2 text-sm outline-none focus:border-blue resize-none" />
                )}
                {nextStatus === 'InRepair' && (
                  <input type="number" value={repairCost} onChange={(e) => setRepairCost(e.target.value)}
                    placeholder="Стоимость ремонта (₼)*"
                    className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue" />
                )}

                <Button loading={updating} disabled={!nextStatus} className="w-full" onClick={handleStatusUpdate}>
                  Обновить
                </Button>
              </div>
            </div>
          )}

          {/* Device info */}
          <div className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="mb-3 font-display font-semibold text-text">Устройство</h2>
            <dl className="space-y-2 text-sm">
              {[['Тип', ticket.deviceType], ['Бренд', ticket.deviceBrand], ['Модель', ticket.deviceModel], ['S/N', ticket.serialNumber ?? '—']].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <dt className="text-muted">{l}</dt><dd className="font-medium text-text">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
