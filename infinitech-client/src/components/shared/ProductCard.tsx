import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAddToCartMutation } from '../../api/cartApi';
import { useAppSelector } from '../../app/hooks';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const navigate = useNavigate();
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (role !== 'Client') { toast.error('Только клиенты могут добавлять товары в корзину'); return; }
    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
      toast.success('Добавлено в корзину');
    } catch {
      toast.error('Ошибка добавления в корзину');
    }
  };

  return (
    <div
      onClick={() => navigate(`/shop/${product.id}`)}
      className="group cursor-pointer rounded-card bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg overflow-hidden"
    >
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-xlight to-bg text-6xl">
        {product.categoryEmoji || '📦'}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant={product.condition === 'New' ? 'blue' : 'warning'}>
            {product.condition === 'New' ? 'Новый' : 'Б/У'}
          </Badge>
          <span className="text-xs text-muted">{product.categoryName}</span>
        </div>
        <h3 className="mb-1 font-display text-sm font-semibold leading-tight text-text line-clamp-2">
          {product.name}
        </h3>
        {!compact && (
          <p className="mb-3 text-xs text-muted line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-navy">
            ₼{product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            loading={isLoading}
            disabled={product.stockQuantity === 0}
            leftIcon={<ShoppingCart size={14} />}
            onClick={handleAdd}
          >
            {product.stockQuantity === 0 ? 'Нет в наличии' : 'В корзину'}
          </Button>
        </div>
      </div>
    </div>
  );
}
