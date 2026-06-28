import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../../api/ordersApi';
import { OrderStatusBadge } from '../../components/shared/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from '../utils/format';

export function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyOrdersQuery({ page, pageSize: 10 });

  if (isLoading) return <SkeletonList count={5} />;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Мои заказы</h1>
      {!data?.items.length ? (
        <EmptyState icon="📦" title="Заказов пока нет"
          description="Перейдите в каталог и оформите первый заказ"
          action={{ label: 'В магазин', onClick: () => navigate('/shop') }} />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((o) => (
              <button key={o.id} onClick={() => navigate(`/client/orders/${o.id}`)}
                className="flex w-full items-center justify-between rounded-card bg-surface p-4 shadow-card hover:shadow-card-lg transition-shadow text-left gap-4">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-text">Заказ #{o.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted">{format.date(o.createdAt)} · {o.items.length} позиций</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <p className="font-bold text-navy">{format.price(o.totalAmount)}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
