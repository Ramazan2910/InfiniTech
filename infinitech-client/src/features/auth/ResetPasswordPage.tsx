import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../../components/layout/Logo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useResetPasswordMutation } from '../../api/authApi';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="text-center">
          <p className="text-danger text-lg">Неверная ссылка для сброса пароля.</p>
          <Link to="/auth/forgot-password" className="mt-4 block text-blue hover:underline">
            Запросить новую
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword({ token, newPassword }).unwrap();
      toast.success(t('auth.passwordChanged'));
      navigate('/auth/login');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error ?? 'Ошибка сброса пароля');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-card bg-surface p-8 shadow-card">
          <h1 className="mb-6 font-display text-2xl font-bold text-text">{t('auth.resetPassword')}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.newPassword')} type="password"
              leftIcon={<Lock size={16} />}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              required minLength={8}
            />
            <Button type="submit" loading={isLoading} className="w-full">{t('auth.resetBtn')}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            <Link to="/auth/login" className="font-medium text-blue hover:text-blue-light">
              ← {t('auth.backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
