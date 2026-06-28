import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/layout/Logo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRegisterMutation } from '../../api/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName:  z.string().min(2, 'Минимум 2 символа'),
  lastName:   z.string().min(2, 'Минимум 2 символа'),
  email:      z.string().email('Некорректный email'),
  phone:      z.string().optional(),
  password:   z.string().min(8, 'Минимум 8 символов').regex(/[A-Z]/, 'Нужна заглавная буква').regex(/[0-9]/, 'Нужна цифра'),
  confirm:    z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Пароли не совпадают', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { register: reg, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ confirm: _, ...data }: FormData) => {
    try {
      const result = await register(data).unwrap();
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      toast.success('Аккаунт создан!');
      navigate('/client/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      const msg = e?.data?.error ?? 'Ошибка регистрации';
      setError('email', { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-card bg-surface p-8 shadow-card">
          <h1 className="mb-6 font-display text-2xl font-bold text-text">Создать аккаунт</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Имя" {...reg('firstName')} error={errors.firstName?.message} />
              <Input label="Фамилия" {...reg('lastName')} error={errors.lastName?.message} />
            </div>
            <Input label="Email" type="email" {...reg('email')} error={errors.email?.message} />
            <Input label="Телефон (необяз.)" type="tel" placeholder="+994 ..." {...reg('phone')} />
            <Input label="Пароль" type="password" {...reg('password')} error={errors.password?.message} />
            <Input label="Повторите пароль" type="password" {...reg('confirm')} error={errors.confirm?.message} />
            <Button type="submit" loading={isLoading} className="w-full mt-2">Зарегистрироваться</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Уже есть аккаунт?{' '}
            <Link to="/auth/login" className="font-medium text-blue hover:text-blue-light">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
