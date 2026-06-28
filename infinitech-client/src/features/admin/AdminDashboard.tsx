import { useNavigate } from 'react-router-dom';
import { useGetDashboardQuery } from '../../api/adminApi';
import { OrderStatusBadge } from '../../components/shared/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { format } from '../utils/format';
import { TrendingUp, Package, Wrench, Users, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading) return <PageSpinner />;
  if (!data) return <div className="text-center py-20 text-muted">Нет данных</div>;

  const statCards = [
    { label: 'Общая выручка',      value: format.price(data.totalRevenue),   icon: <TrendingUp size={20} />, color: 'text-success bg-green-50' },
    { label: 'Заказов в этом месяце', value: data.ordersThisMonth,            icon: <Package size={20} />,    color: 'text-blue bg-blue-xlight' },
    { label: 'Активных ремонтов',  value: data.activeRepairs,                icon: <Wrench size={20} />,     color: 'text-warning bg-amber-50' },
    { label: 'Пользователей',      value: data.totalUsers,                   icon: <Users size={20} />,      color: 'text-navy bg-blue-xlight' },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold text-text">Дашборд</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-card bg-surface p-5 shadow-card">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-btn ${s.color}`}>{s.icon}</div>
            <p className="font-display text-2xl font-bold text-text">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-card bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-text">Последние заказы</h2>
            <button onClick={() => navigate('/admin/orders')} className="text-xs text-blue hover:underline">Все</button>
          </div>
          <div className="space-y-2">
            {data.recentOrders.map((o) => (
              <button key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)}
                className="flex w-full items-center justify-between rounded-btn border border-border p-3 hover:bg-bg transition text-left">
                <div>
                  <p className="text-sm font-medium text-text">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted">{format.date(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-navy">{format.price(o.totalAmount)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-card bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <h2 className="font-display text-base font-semibold text-text">Мало на складе</h2>
          </div>
          <div className="space-y-2">
            {data.lowStockProducts.length === 0 && <p className="text-sm text-muted">Всё в порядке</p>}
            {data.lowStockProducts.map((p) => (
              <button key={p.id} onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                className="flex w-full items-center justify-between rounded-btn border border-border p-3 hover:bg-bg transition text-left">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted">{p.sku}</p>
                </div>
                <span className={`text-xs font-bold rounded-chip px-2 py-0.5 ${p.stockQuantity === 0 ? 'bg-red-100 text-danger' : 'bg-amber-100 text-warning'}`}>
                  {p.stockQuantity} шт.
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets by status */}
      <div className="mt-6 rounded-card bg-surface p-6 shadow-card">
        <h2 className="mb-4 font-display text-base font-semibold text-text">Заявки по статусам</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.ticketsByStatus).map(([status, count]) => (
            <div key={status} className="rounded-card border border-border px-4 py-3 text-center min-w-[100px]">
              <p className="font-display text-xl font-bold text-navy">{count}</p>
              <p className="text-xs text-muted">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
