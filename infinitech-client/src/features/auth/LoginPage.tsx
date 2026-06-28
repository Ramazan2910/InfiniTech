import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../../components/layout/Logo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useLoginMutation } from '../../api/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      const role = result.user.role;
      const dest = from && from !== '/auth/login'
        ? from
        : role === 'Admin' ? '/admin/dashboard'
        : role === 'Master' ? '/master/dashboard'
        : '/client/dashboard';
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      const msg = e?.data?.error ?? 'Неверный email или пароль';
      setError('password', { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-card bg-surface p-8 shadow-card">
          <h1 className="mb-6 font-display text-2xl font-bold text-text">Вход в аккаунт</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" leftIcon={<Mail size={16} />}
              {...register('email')} error={errors.email?.message} />
            <Input label="Пароль" type="password" leftIcon={<Lock size={16} />}
              {...register('password')} error={errors.password?.message} />
            <Button type="submit" loading={isLoading} className="w-full mt-2">Войти</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Нет аккаунта?{' '}
            <Link to="/auth/register" className="font-medium text-blue hover:text-blue-light">
              Зарегистрироваться
            </Link>
          </p>
        </div>
        {/* Demo accounts */}
        <div className="mt-4 rounded-card border border-border bg-surface/50 p-4 text-xs text-muted">
          <p className="mb-2 font-semibold text-text">Демо аккаунты:</p>
          <p>👤 client1@test.az / Client123!</p>
          <p>🔧 master1@test.az / Master123!</p>
          <p>⚙️ admin@test.az / Admin123!</p>
        </div>
      </div>
    </div>
  );
}
