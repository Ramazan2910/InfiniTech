import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useGetMyTicketsQuery } from '../../api/ticketsApi';
import { TicketStatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from '../utils/format';

export function RepairsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyTicketsQuery({ page, pageSize: 10 });

  if (isLoading) return <SkeletonList />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Мои заявки на ремонт</h1>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/client/repairs/new')}>
          Новая заявка
        </Button>
      </div>

      {!data?.items.length ? (
        <EmptyState icon="🔧" title="Заявок пока нет"
          description="Оставьте заявку на ремонт устройства"
          action={{ label: 'Создать заявку', onClick: () => navigate('/client/repairs/new') }} />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((t) => (
              <button key={t.id} onClick={() => navigate(`/client/repairs/${t.id}`)}
                className="flex w-full items-center justify-between rounded-card bg-surface p-4 shadow-card hover:shadow-card-lg transition-shadow text-left gap-4">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-text">{t.deviceBrand} {t.deviceModel}</p>
                  <p className="text-sm text-muted">{t.deviceType} · {format.date(t.createdAt)}</p>
                  {t.masterName && <p className="text-xs text-blue">Мастер: {t.masterName}</p>}
                </div>
                <TicketStatusBadge status={t.status} />
              </button>
            ))}
          </div>
          <div className="mt-6"><Pagination page={page} totalPages={data.totalPages} onChange={setPage} /></div>
        </>
      )}
    </div>
  );
}
