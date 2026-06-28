import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from '../../api/cartApi';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from '../utils/format';
import toast from 'react-hot-toast';

export function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useGetCartQuery();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();

  if (isLoading) return <PageSpinner />;

  const handleQty = async (productId: string, quantity: number) => {
    try { await updateItem({ productId, quantity }).unwrap(); }
    catch { toast.error('Ошибка обновления'); }
  };

  const handleRemove = async (productId: string) => {
    try { await removeItem(productId).unwrap(); }
    catch { toast.error('Ошибка удаления'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Корзина</h1>
        {(cart?.items.length ?? 0) > 0 && (
          <button onClick={() => clearCart()} className="text-sm text-danger hover:underline">
            Очистить корзину
          </button>
        )}
      </div>

      {!cart?.items.length ? (
        <EmptyState icon="🛒" title="Корзина пуста"
          description="Добавьте товары из каталога"
          action={{ label: 'В магазин', onClick: () => navigate('/shop') }} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-card">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-bg text-3xl">
                  {item.categoryEmoji || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-text line-clamp-1">{item.productName}</p>
                    <Badge variant={item.condition === 'New' ? 'blue' : 'warning'} size="sm">
                      {item.condition === 'New' ? 'Новый' : 'Б/У'}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-navy">{format.price(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-btn border border-border">
                    <button onClick={() => item.quantity > 1 ? handleQty(item.productId, item.quantity - 1) : handleRemove(item.productId)}
                      className="px-2 py-1.5 text-muted hover:text-navy"><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => handleQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="px-2 py-1.5 text-muted hover:text-navy disabled:opacity-30"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => handleRemove(item.productId)} className="text-muted hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-card bg-surface p-6 shadow-card h-fit">
            <h2 className="mb-4 font-display text-lg font-bold text-text">Итого</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-muted">
                <span>Товары ({cart.itemCount})</span>
                <span>{format.price(cart.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Доставка</span>
                <span className="text-success">Бесплатно</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between mb-5">
              <span className="font-semibold text-text">Итого</span>
              <span className="font-display text-xl font-bold text-navy">{format.price(cart.total)}</span>
            </div>
            <Button className="w-full" leftIcon={<ShoppingBag size={16} />}
              onClick={() => navigate('/client/checkout')}>
              Оформить заказ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
