import { useState } from 'react';
import { Search } from 'lucide-react';
import { useGetAdminUsersQuery, useChangeUserStatusMutation, useChangeUserRoleMutation } from '../../api/adminApi';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { format } from '../utils/format';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const { data, isLoading } = useGetAdminUsersQuery({ page, pageSize: 15, search: search || undefined, role: roleFilter || undefined });
  const [changeStatus] = useChangeUserStatusMutation();
  const [changeRole] = useChangeUserRoleMutation();

  const handleStatus = async (id: string, isActive: boolean) => {
    try { await changeStatus({ id, isActive }).unwrap(); toast.success('Статус обновлён'); }
    catch { toast.error('Ошибка'); }
  };

  const handleRole = async (id: string, role: UserRole) => {
    try { await changeRole({ id, role }).unwrap(); toast.success('Роль изменена'); }
    catch (err: unknown) { const e = err as { data?: { error?: string } }; toast.error(e?.data?.error ?? 'Ошибка'); }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Пользователи</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Поиск по имени, email..."
            className="w-full rounded-btn border border-border bg-surface pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
          className="rounded-btn border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-blue">
          <option value="">Все роли</option>
          <option value="Client">Клиент</option>
          <option value="Master">Мастер</option>
          <option value="Admin">Администратор</option>
        </select>
      </div>

      {isLoading ? <SkeletonList /> : (
        <div className="rounded-card bg-surface shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg">
              <tr>
                {['Пользователь', 'Email', 'Роль', 'Статус', 'Дата', 'Действия'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((u) => (
                <tr key={u.id} className="hover:bg-bg transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{u.firstName} {u.lastName}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => handleRole(u.id, e.target.value as UserRole)}
                      className="rounded-btn border border-border px-2 py-1 text-xs outline-none focus:border-blue">
                      <option value="Client">Клиент</option>
                      <option value="Master">Мастер</option>
                      <option value="Admin">Администратор</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Активен' : 'Заблокирован'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{format.date(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleStatus(u.id, !u.isActive)}
                      className={`text-xs font-medium ${u.isActive ? 'text-danger hover:text-danger/80' : 'text-success hover:text-success/80'}`}>
                      {u.isActive ? 'Заблокировать' : 'Разблокировать'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && <div className="py-16 text-center text-muted">Пользователи не найдены</div>}
        </div>
      )}
      <div className="mt-6"><Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} /></div>
    </div>
  );
}
