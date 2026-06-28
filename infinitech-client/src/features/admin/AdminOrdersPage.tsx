import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from '../../api/ordersApi';
import { OrderStatusBadge } from '../../components/shared/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { format } from '../utils/format';
import type { OrderStatus } from '../../types';
import toast from 'react-hot-toast';

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Ожидает', Confirmed: 'Подтверждён', Processing: 'Обрабатывается',
  Shipped: 'Отправлен', Delivered: 'Доставлен', Cancelled: 'Отменён',
};

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const { data, isLoading } = useGetAdminOrdersQuery({ page, pageSize: 15, status: statusFilter || undefined });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatus = async (id: string, status: OrderStatus) => {
    try { await updateStatus({ id, status }).unwrap(); toast.success('Статус обновлён'); }
    catch { toast.error('Ошибка'); }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Управление заказами</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('')}
          className={`rounded-chip px-3 py-1 text-sm transition ${statusFilter === '' ? 'bg-navy text-white' : 'bg-surface border border-border text-muted'}`}>
          Все
        </button>
        {ORDER_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-chip px-3 py-1 text-sm transition ${statusFilter === s ? 'bg-navy text-white' : 'bg-surface border border-border text-muted'}`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? <SkeletonList /> : (
        <div className="rounded-card bg-surface shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg">
              <tr>
                {['Заказ', 'Дата', 'Сумма', 'Позиций', 'Статус', 'Действие'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((o) => (
                <tr key={o.id} className="hover:bg-bg transition">
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="font-medium text-blue hover:underline">
                      #{o.id.slice(0, 8)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{format.date(o.createdAt)}</td>
                  <td className="px-4 py-3 font-bold text-navy">{format.price(o.totalAmount)}</td>
                  <td className="px-4 py-3 text-muted">{o.items.length}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={(e) => handleStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-btn border border-border px-2 py-1 text-xs outline-none focus:border-blue">
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && <div className="py-16 text-center text-muted">Заказов нет</div>}
        </div>
      )}
      <div className="mt-6"><Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} /></div>
    </div>
  );
}
