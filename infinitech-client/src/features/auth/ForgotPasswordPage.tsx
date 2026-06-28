import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../../components/layout/Logo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useForgotPasswordMutation } from '../../api/authApi';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch {
      toast.error('Произошла ошибка. Попробуйте снова.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-card bg-surface p-8 shadow-card">
          <h1 className="mb-2 font-display text-2xl font-bold text-text">{t('auth.forgotPasswordTitle')}</h1>
          <p className="mb-6 text-sm text-muted">{t('auth.forgotPasswordDesc')}</p>

          {sent ? (
            <div className="rounded-card bg-blue-50 border border-blue/20 p-4 text-sm text-navy">
              {t('auth.emailSent')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('auth.email')} type="email"
                leftIcon={<Mail size={16} />}
                value={email} onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={isLoading} className="w-full">{t('auth.sendLink')}</Button>
            </form>
          )}

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
