import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useGetMyOrdersQuery } from '../../api/ordersApi';
import { useGetMyTicketsQuery } from '../../api/ticketsApi';
import { useGetCartQuery } from '../../api/cartApi';
import { OrderStatusBadge, TicketStatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ShoppingCart, Package, Wrench, Plus } from 'lucide-react';
import { format } from '../utils/format';

export function ClientDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const { data: orders } = useGetMyOrdersQuery({ page: 1, pageSize: 3 });
  const { data: tickets } = useGetMyTicketsQuery({ page: 1, pageSize: 3 });
  const { data: cart } = useGetCartQuery();

  const activeTickets = tickets?.items.filter((t) => !['Completed', 'Cancelled'].includes(t.status)) ?? [];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-text">
          Добро пожаловать, {user?.firstName}! 👋
        </h1>
        <p className="text-sm text-muted mt-1">Ваш личный кабинет</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Активных заявок', value: activeTickets.length, icon: <Wrench size={20} />, onClick: () => navigate('/client/repairs') },
          { label: 'Заказов',          value: orders?.totalCount ?? 0, icon: <Package size={20} />, onClick: () => navigate('/client/orders') },
          { label: 'В корзине',        value: cart?.itemCount ?? 0,    icon: <ShoppingCart size={20} />, onClick: () => navigate('/client/cart') },
        ].map((s) => (
          <button key={s.label} onClick={s.onClick}
            className="group rounded-card bg-surface p-5 shadow-card text-left hover:shadow-card-lg transition-shadow">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-btn bg-blue-xlight text-blue group-hover:bg-blue group-hover:text-white transition">
              {s.icon}
            </div>
            <p className="font-display text-2xl font-bold text-navy">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="rounded-card bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-text">Последние заказы</h2>
            <button onClick={() => navigate('/client/orders')} className="text-xs text-blue hover:underline">Все</button>
          </div>
          {orders?.items.length ? (
            <div className="space-y-3">
              {orders.items.map((o) => (
                <button key={o.id} onClick={() => navigate(`/client/orders/${o.id}`)}
                  className="flex w-full items-center justify-between rounded-btn border border-border p-3 hover:bg-bg transition">
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">Заказ #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted">{format.date(o.createdAt)} · ₼{o.totalAmount.toFixed(2)}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted">
              Заказов пока нет
              <div className="mt-3">
                <Button size="sm" onClick={() => navigate('/shop')}>Перейти в магазин</Button>
              </div>
            </div>
          )}
        </div>

        {/* Active tickets */}
        <div className="rounded-card bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-text">Заявки на ремонт</h2>
            <button onClick={() => navigate('/client/repairs')} className="text-xs text-blue hover:underline">Все</button>
          </div>
          {tickets?.items.length ? (
            <div className="space-y-3">
              {tickets.items.slice(0, 3).map((t) => (
                <button key={t.id} onClick={() => navigate(`/client/repairs/${t.id}`)}
                  className="flex w-full items-center justify-between rounded-btn border border-border p-3 hover:bg-bg transition">
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">{t.deviceBrand} {t.deviceModel}</p>
                    <p className="text-xs text-muted">{t.deviceType} · {format.date(t.createdAt)}</p>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted">
              Заявок пока нет
              <div className="mt-3">
                <Button size="sm" onClick={() => navigate('/client/repairs/new')} leftIcon={<Plus size={14} />}>
                  Создать заявку
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/shop')}
          className="flex items-center gap-3 rounded-card bg-blue p-5 text-white shadow-card hover:bg-blue-light transition">
          <ShoppingCart size={24} />
          <div className="text-left">
            <p className="font-display font-semibold">Магазин</p>
            <p className="text-xs text-white/70">Новые и б/у товары</p>
          </div>
        </button>
        <button onClick={() => navigate('/client/repairs/new')}
          className="flex items-center gap-3 rounded-card bg-navy p-5 text-white shadow-card hover:bg-navy-mid transition">
          <Wrench size={24} />
          <div className="text-left">
            <p className="font-display font-semibold">Новая заявка</p>
            <p className="text-xs text-white/70">Ремонт устройства</p>
          </div>
        </button>
      </div>
    </div>
  );
}
