import { useState } from 'react';
import { Search, Plus, Trash2, KeyRound, RefreshCw } from 'lucide-react';
import {
  useGetAdminUsersQuery, useChangeUserStatusMutation, useChangeUserRoleMutation,
  useCreateAdminUserMutation, useDeleteAdminUserMutation,
  useAdminChangePasswordMutation, useAdminResetPasswordMutation,
} from '../../api/adminApi';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import { format } from '../utils/format';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

type ModalType = 'create' | 'changePass' | 'resetPass' | 'delete' | null;

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');

  // Create form state
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'Client' as UserRole });

  const { data, isLoading } = useGetAdminUsersQuery({ page, pageSize: 15, search: search || undefined, role: roleFilter || undefined });
  const [changeStatus] = useChangeUserStatusMutation();
  const [changeRole] = useChangeUserRoleMutation();
  const [createUser, { isLoading: creating }] = useCreateAdminUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();
  const [changePass, { isLoading: changingPass }] = useAdminChangePasswordMutation();
  const [resetPass, { isLoading: resetting }] = useAdminResetPasswordMutation();

  const openModal = (type: ModalType, id = '') => { setModal(type); setSelectedId(id); setNewPassword(''); };
  const closeModal = () => { setModal(null); setSelectedId(''); };

  const handleStatus = async (id: string, isActive: boolean) => {
    try { await changeStatus({ id, isActive }).unwrap(); toast.success('Статус обновлён'); }
    catch { toast.error('Ошибка'); }
  };

  const handleRole = async (id: string, role: UserRole) => {
    try { await changeRole({ id, role }).unwrap(); toast.success('Роль изменена'); }
    catch (err: unknown) { const e = err as { data?: { error?: string } }; toast.error(e?.data?.error ?? 'Ошибка'); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(form).unwrap();
      toast.success('Пользователь создан');
      closeModal();
      setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'Client' });
    } catch (err: unknown) { const e = err as { data?: { error?: string } }; toast.error(e?.data?.error ?? 'Ошибка'); }
  };

  const handleDelete = async () => {
    try { await deleteUser(selectedId).unwrap(); toast.success('Пользователь удалён'); closeModal(); }
    catch (err: unknown) { const e = err as { data?: { error?: string } }; toast.error(e?.data?.error ?? 'Ошибка'); }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await changePass({ id: selectedId, newPassword }).unwrap(); toast.success('Пароль изменён'); closeModal(); }
    catch (err: unknown) { const e = err as { data?: { error?: string } }; toast.error(e?.data?.error ?? 'Ошибка'); }
  };

  const handleResetPass = async () => {
    try {
      const res = await resetPass(selectedId).unwrap();
      toast.success(`Временный пароль: ${res.temporaryPassword}`, { duration: 10000 });
      closeModal();
    } catch (err: unknown) { const e = err as { data?: { error?: string } }; toast.error(e?.data?.error ?? 'Ошибка'); }
  };

  const inputCls = 'w-full rounded-btn border border-border px-3 py-2 text-sm outline-none focus:border-blue';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Пользователи</h1>
        <button onClick={() => openModal('create')}
          className="flex items-center gap-2 rounded-btn bg-navy text-white px-4 py-2.5 text-sm font-medium hover:bg-navy/90 transition">
          <Plus size={16} /> Создать пользователя
        </button>
      </div>

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
        <div className="rounded-card bg-surface shadow-card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
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
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStatus(u.id, !u.isActive)}
                        className={`text-xs font-medium px-2 py-1 rounded-btn transition
                          ${u.isActive ? 'text-danger hover:bg-red-50' : 'text-success hover:bg-green-50'}`}>
                        {u.isActive ? 'Заблок.' : 'Разблок.'}
                      </button>
                      <button title="Сменить пароль" onClick={() => openModal('changePass', u.id)}
                        className="rounded-btn p-1.5 text-muted hover:text-navy hover:bg-bg transition">
                        <KeyRound size={14} />
                      </button>
                      <button title="Сбросить пароль" onClick={() => openModal('resetPass', u.id)}
                        className="rounded-btn p-1.5 text-muted hover:text-blue hover:bg-bg transition">
                        <RefreshCw size={14} />
                      </button>
                      <button title="Удалить" onClick={() => openModal('delete', u.id)}
                        className="rounded-btn p-1.5 text-muted hover:text-danger hover:bg-red-50 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && <div className="py-16 text-center text-muted">Пользователи не найдены</div>}
        </div>
      )}
      <div className="mt-6"><Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} /></div>

      {/* Create Modal */}
      {modal === 'create' && (
        <Modal title="Создать пользователя" onClose={closeModal}>
          <form onSubmit={handleCreate} className="space-y-3">
            {[
              ['firstName', 'Имя'],
              ['lastName', 'Фамилия'],
              ['email', 'Email'],
              ['password', 'Пароль'],
              ['phone', 'Телефон (необяз.)'],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-muted mb-1">{label}</label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className={inputCls}
                  required={field !== 'phone'}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Роль</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                className={inputCls}>
                <option value="Client">Клиент</option>
                <option value="Master">Мастер</option>
                <option value="Admin">Администратор</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 rounded-btn border border-border py-2 text-sm text-muted hover:bg-bg">Отмена</button>
              <button type="submit" disabled={creating}
                className="flex-1 rounded-btn bg-navy py-2 text-sm text-white hover:bg-navy/90 disabled:opacity-50">
                {creating ? '...' : 'Создать'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password Modal */}
      {modal === 'changePass' && (
        <Modal title="Сменить пароль" onClose={closeModal}>
          <form onSubmit={handleChangePass} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Новый пароль</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls} required minLength={8} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 rounded-btn border border-border py-2 text-sm text-muted hover:bg-bg">Отмена</button>
              <button type="submit" disabled={changingPass}
                className="flex-1 rounded-btn bg-navy py-2 text-sm text-white hover:bg-navy/90 disabled:opacity-50">
                {changingPass ? '...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {modal === 'resetPass' && (
        <Modal title="Сбросить пароль?" onClose={closeModal}>
          <p className="mb-4 text-sm text-muted">Будет создан временный пароль и показан вам на экране.</p>
          <div className="flex gap-2">
            <button onClick={closeModal}
              className="flex-1 rounded-btn border border-border py-2 text-sm text-muted hover:bg-bg">Отмена</button>
            <button onClick={handleResetPass} disabled={resetting}
              className="flex-1 rounded-btn bg-blue py-2 text-sm text-white hover:bg-blue-light disabled:opacity-50">
              {resetting ? '...' : 'Сбросить'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <Modal title="Удалить пользователя?" onClose={closeModal}>
          <p className="mb-4 text-sm text-muted">Данные пользователя будут анонимизированы. Это действие необратимо.</p>
          <div className="flex gap-2">
            <button onClick={closeModal}
              className="flex-1 rounded-btn border border-border py-2 text-sm text-muted hover:bg-bg">Отмена</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 rounded-btn bg-danger py-2 text-sm text-white hover:bg-danger/80 disabled:opacity-50">
              {deleting ? '...' : 'Удалить'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-card bg-surface shadow-card-lg p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-text">{title}</h2>
        {children}
      </div>
    </div>
  );
}
