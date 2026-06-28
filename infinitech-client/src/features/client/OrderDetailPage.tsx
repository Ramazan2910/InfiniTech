import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetOrderQuery } from '../../api/ordersApi';
import { OrderStatusBadge } from '../../components/shared/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { format } from '../utils/format';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrderQuery(id!);

  if (isLoading) return <PageSpinner />;
  if (!order) return <div className="text-center py-20 text-muted">Заказ не найден</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-navy transition">
        <ArrowLeft size={16} /> Назад
      </button>

      <div className="rounded-card bg-surface p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-text">Заказ #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted">{format.dateTime(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="space-y-3 mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-btn border border-border p-3">
              <div>
                <p className="font-medium text-text">{item.productName}</p>
                <p className="text-xs text-muted">×{item.quantity}</p>
              </div>
              <p className="font-bold text-navy">{format.price(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 flex justify-between">
          <p className="font-semibold text-text">Итого</p>
          <p className="font-display text-xl font-bold text-navy">{format.price(order.totalAmount)}</p>
        </div>

        {order.deliveryAddress && (
          <p className="mt-4 text-sm text-muted">Адрес: {order.deliveryAddress}</p>
        )}
        {order.notes && <p className="text-sm text-muted">Примечание: {order.notes}</p>}
      </div>
    </div>
  );
}
