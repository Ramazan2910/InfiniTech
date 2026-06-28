import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetMyOrdersQuery } from '../../api/ordersApi';
import { OrderStatusBadge } from '../../components/shared/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from '../utils/format';
import type { OrderStatus } from '../../types';

const ACTIVE_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped'];
const HISTORY_STATUSES: OrderStatus[] = ['Delivered', 'Cancelled'];

export function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyOrdersQuery({ page, pageSize: 10 });

  if (isLoading) return <SkeletonList count={5} />;

  const statuses = tab === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES;
  const filtered = data?.items.filter((o) => statuses.includes(o.status)) ?? [];

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-text">{t('orders.title')}</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-card bg-bg p-1 w-fit border border-border">
        {(['active', 'history'] as const).map((t2) => (
          <button key={t2} onClick={() => { setTab(t2); setPage(1); }}
            className={`rounded-btn px-4 py-1.5 text-sm font-medium transition
              ${tab === t2 ? 'bg-surface shadow-card text-navy' : 'text-muted hover:text-text'}`}>
            {t2 === 'active' ? t('orders.active') : t('orders.history')}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <EmptyState icon="📦" title={t('orders.empty')}
          description={t('orders.emptyDesc')}
          action={{ label: t('orders.goShopping'), onClick: () => navigate('/shop') }} />
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((o) => (
              <button key={o.id} onClick={() => navigate(`/client/orders/${o.id}`)}
                className="flex w-full items-center justify-between rounded-card bg-surface p-4 shadow-card hover:shadow-card-lg transition-shadow text-left gap-4">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-text">
                    {o.orderNumber ? o.orderNumber : `#${o.id.slice(0, 8)}`}
                  </p>
                  <p className="text-sm text-muted">{format.date(o.createdAt)} · {o.items.length} {t('orders.items')}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <p className="font-bold text-navy">{format.price(o.totalAmount)}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
