import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useGetCartQuery } from '../../api/cartApi';
import { useCreateOrderMutation } from '../../api/ordersApi';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { format } from '../utils/format';
import toast from 'react-hot-toast';

interface FormData { deliveryAddress: string; notes: string }

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const order = await createOrder({ deliveryAddress: data.deliveryAddress || undefined, notes: data.notes || undefined }).unwrap();
      toast.success('Заказ оформлен!');
      navigate(`/client/orders/${order.id}`);
    } catch {
      toast.error('Ошибка оформления заказа');
    }
  };

  if (!cart?.items.length) { navigate('/client/cart'); return null; }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Оформление заказа</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Items review */}
        <div className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="mb-4 font-display text-base font-semibold text-text">Ваши товары</h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-text">{item.productName} ×{item.quantity}</span>
                <span className="font-medium text-navy">{format.price(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4 flex justify-between font-bold">
            <span>Итого</span>
            <span className="text-navy">{format.price(cart.total)}</span>
          </div>
        </div>

        {/* Delivery */}
        <div className="rounded-card bg-surface p-6 shadow-card space-y-4">
          <h2 className="font-display text-base font-semibold text-text">Данные доставки</h2>
          <Input label="Адрес доставки" placeholder="ул. Пример, д. 1, кв. 5, Баку" {...register('deliveryAddress')} />
          <div>
            <label className="block text-sm font-medium text-text mb-1">Примечание</label>
            <textarea {...register('notes')} rows={3} placeholder="Пожелания к заказу..."
              className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue focus:ring-1 focus:ring-blue resize-none" />
          </div>
        </div>

        <Button type="submit" loading={isLoading} size="lg" className="w-full">
          Подтвердить заказ
        </Button>
      </form>
    </div>
  );
}
