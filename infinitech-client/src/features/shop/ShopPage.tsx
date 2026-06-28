import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useGetProductsQuery } from '../../api/productsApi';
import { useGetCategoriesQuery } from '../../api/productsApi';
import { ProductCard } from '../../components/shared/ProductCard';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ProductQueryParams } from '../../types';

const PAGE_SIZE = 12;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params: ProductQueryParams = {
    page: Number(searchParams.get('page') ?? 1),
    pageSize: PAGE_SIZE,
    search: searchParams.get('search') ?? undefined,
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    condition: searchParams.get('condition') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: searchParams.get('sortBy') ?? undefined,
  };

  const { data, isLoading } = useGetProductsQuery(params);
  const { data: categories } = useGetCategoriesQuery();

  const set = (key: string, val: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const sortOptions = [
    { value: '', label: 'По умолчанию' },
    { value: 'price_asc', label: 'Цена: от низкой' },
    { value: 'price_desc', label: 'Цена: от высокой' },
    { value: 'newest', label: 'Новые сначала' },
  ];

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-text">Каталог товаров</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={searchParams.get('search') ?? ''}
                onChange={(e) => set('search', e.target.value || undefined)}
                placeholder="Поиск товаров..."
                className="rounded-btn border border-border bg-surface pl-9 pr-4 py-2 text-sm text-text outline-none focus:border-blue focus:ring-1 focus:ring-blue w-52"
              />
            </div>
            <select
              value={searchParams.get('sortBy') ?? ''}
              onChange={(e) => set('sortBy', e.target.value || undefined)}
              className="rounded-btn border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-blue">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 rounded-btn border border-border bg-surface px-3 py-2 text-sm text-muted hover:border-blue hover:text-navy transition">
              <SlidersHorizontal size={16} /> Фильтры
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`shrink-0 w-56 space-y-6 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
            {/* Category */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Категория</p>
              <div className="space-y-1">
                <button onClick={() => set('categoryId', undefined)}
                  className={`w-full rounded-btn px-3 py-1.5 text-left text-sm transition
                    ${!params.categoryId ? 'bg-blue text-white' : 'text-text hover:bg-bg'}`}>
                  Все категории
                </button>
                {categories?.map((c) => (
                  <button key={c.id} onClick={() => set('categoryId', String(c.id))}
                    className={`w-full rounded-btn px-3 py-1.5 text-left text-sm transition
                      ${params.categoryId === c.id ? 'bg-blue text-white' : 'text-text hover:bg-bg'}`}>
                    {c.iconEmoji} {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Состояние</p>
              <div className="space-y-1">
                {[['', 'Любое'], ['New', 'Новый'], ['Used', 'Б/У']].map(([val, label]) => (
                  <button key={val} onClick={() => set('condition', val || undefined)}
                    className={`w-full rounded-btn px-3 py-1.5 text-left text-sm transition
                      ${(params.condition ?? '') === val ? 'bg-blue text-white' : 'text-text hover:bg-bg'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Цена (₼)</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="От"
                  value={searchParams.get('minPrice') ?? ''}
                  onChange={(e) => set('minPrice', e.target.value || undefined)}
                  className="w-full rounded-btn border border-border px-2 py-1.5 text-sm outline-none focus:border-blue" />
                <span className="text-muted">—</span>
                <input type="number" placeholder="До"
                  value={searchParams.get('maxPrice') ?? ''}
                  onChange={(e) => set('maxPrice', e.target.value || undefined)}
                  className="w-full rounded-btn border border-border px-2 py-1.5 text-sm outline-none focus:border-blue" />
              </div>
            </div>

            {/* Reset */}
            {(params.search || params.categoryId || params.condition || params.minPrice || params.maxPrice) && (
              <button onClick={() => setSearchParams({})}
                className="flex items-center gap-2 text-sm text-danger hover:text-danger/80">
                <X size={14} /> Сбросить фильтры
              </button>
            )}
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : !data?.items.length ? (
              <EmptyState icon="🔍" title="Ничего не найдено"
                description="Попробуйте изменить фильтры или поисковый запрос"
                action={{ label: 'Сбросить фильтры', onClick: () => setSearchParams({}) }} />
            ) : (
              <>
                <p className="mb-4 text-sm text-muted">{data.totalCount} товаров</p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                <div className="mt-8">
                  <Pagination page={params.page!} totalPages={data.totalPages}
                    onChange={(p) => { const n = new URLSearchParams(searchParams); n.set('page', String(p)); setSearchParams(n); }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
