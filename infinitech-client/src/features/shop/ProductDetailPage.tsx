import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus } from 'lucide-react';
import { useGetProductQuery } from '../../api/productsApi';
import { useAddToCartMutation } from '../../api/cartApi';
import { useAppSelector } from '../../app/hooks';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const { data: product, isLoading } = useGetProductQuery(id!);
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const handleAdd = async () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (user?.role !== 'Client') { toast.error('Только клиенты могут добавлять товары'); return; }
    try {
      await addToCart({ productId: product!.id, quantity: qty }).unwrap();
      toast.success('Добавлено в корзину');
    } catch {
      toast.error('Ошибка добавления');
    }
  };

  if (isLoading) return <div className="pt-20"><PageSpinner /></div>;
  if (!product) return <div className="pt-20 text-center py-20 text-muted">Товар не найден</div>;

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <button onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-navy transition">
          <ArrowLeft size={16} /> Назад
        </button>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="flex h-72 md:h-96 items-center justify-center rounded-card bg-gradient-to-br from-blue-xlight to-bg text-8xl">
            {product.imagePath
              ? <img src={`/uploads/${product.imagePath}`} alt={product.name} className="h-full w-full object-contain rounded-card" />
              : product.categoryEmoji || '📦'}
          </div>

          {/* Info */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant={product.condition === 'New' ? 'blue' : 'warning'}>
                {product.condition === 'New' ? 'Новый' : 'Б/У'}
              </Badge>
              <span className="text-sm text-muted">{product.categoryName}</span>
            </div>
            <h1 className="mb-3 font-display text-2xl font-bold text-text">{product.name}</h1>
            <p className="mb-6 text-sm leading-relaxed text-muted">{product.description}</p>

            <div className="mb-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-navy">₼{product.price.toFixed(2)}</span>
              {product.condition === 'Used' && (
                <span className="text-sm text-muted line-through">₼{(product.price * 1.3).toFixed(2)}</span>
              )}
            </div>

            <div className="mb-2 flex items-center gap-2">
              <Package size={16} className="text-muted" />
              <span className={`text-sm font-medium ${product.stockQuantity > 5 ? 'text-success' : product.stockQuantity > 0 ? 'text-warning' : 'text-danger'}`}>
                {product.stockQuantity > 0 ? `В наличии: ${product.stockQuantity} шт.` : 'Нет в наличии'}
              </span>
            </div>
            <p className="mb-6 text-xs text-muted">SKU: {product.sku}</p>

            {product.stockQuantity > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center rounded-btn border border-border">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted hover:text-navy transition"><Minus size={16} /></button>
                  <span className="w-8 text-center text-sm font-semibold text-text">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))} className="px-3 py-2 text-muted hover:text-navy transition"><Plus size={16} /></button>
                </div>
              </div>
            )}

            <Button size="lg" loading={adding} disabled={product.stockQuantity === 0}
              leftIcon={<ShoppingCart size={18} />} onClick={handleAdd} className="w-full">
              {product.stockQuantity === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
