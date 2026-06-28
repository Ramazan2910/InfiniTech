import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useGetProductsQuery, useDeleteProductMutation } from '../../api/productsApi';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import toast from 'react-hot-toast';

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetProductsQuery({ page, pageSize: 15, search: search || undefined });
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить "${name}"?`)) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success('Товар удалён');
    } catch { toast.error('Ошибка удаления'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-text">Управление товарами</h1>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/admin/products/new')}>
          Добавить товар
        </Button>
      </div>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Поиск по названию, SKU..."
          className="w-full rounded-btn border border-border bg-surface pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue" />
      </div>

      {isLoading ? <SkeletonList count={8} /> : (
        <div className="rounded-card bg-surface shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg">
              <tr>
                {['Товар', 'SKU', 'Категория', 'Состояние', 'Цена', 'Склад', 'Статус', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((p) => (
                <tr key={p.id} className="hover:bg-bg transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.categoryEmoji}</span>
                      <span className="font-medium text-text line-clamp-1 max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 text-muted">{p.categoryName}</td>
                  <td className="px-4 py-3"><Badge variant={p.condition === 'New' ? 'blue' : 'warning'}>{p.condition === 'New' ? 'Новый' : 'Б/У'}</Badge></td>
                  <td className="px-4 py-3 font-bold text-navy">₼{p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stockQuantity < 5 ? 'text-danger' : p.stockQuantity < 10 ? 'text-warning' : 'text-success'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isActive ? 'success' : 'muted'}>{p.isActive ? 'Активен' : 'Скрыт'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                        className="rounded-btn p-1.5 text-muted hover:bg-blue-xlight hover:text-blue transition">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="rounded-btn p-1.5 text-muted hover:bg-red-50 hover:text-danger transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && <div className="py-16 text-center text-muted">Товары не найдены</div>}
        </div>
      )}
      <div className="mt-6">
        <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
      </div>
    </div>
  );
}
