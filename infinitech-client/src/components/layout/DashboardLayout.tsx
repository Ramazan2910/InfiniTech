import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { clearCredentials } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../api/authApi';
import { LogOut, Menu } from 'lucide-react';

interface NavItem { label: string; href: string; icon: string }

const clientNav: NavItem[] = [
  { label: 'Главная', href: '/client/dashboard', icon: '🏠' },
  { label: 'Заказы',  href: '/client/orders',    icon: '📦' },
  { label: 'Ремонт',  href: '/client/repairs',   icon: '🔧' },
  { label: 'Корзина', href: '/client/cart',       icon: '🛒' },
];
const masterNav: NavItem[] = [
  { label: 'Дашборд', href: '/master/dashboard', icon: '📊' },
  { label: 'Заявки',  href: '/master/tickets',   icon: '🔧' },
];
const adminNav: NavItem[] = [
  { label: 'Дашборд',  href: '/admin/dashboard',  icon: '📊' },
  { label: 'Товары',   href: '/admin/products',   icon: '📦' },
  { label: 'Заказы',   href: '/admin/orders',     icon: '🛍️' },
  { label: 'Заявки',   href: '/admin/tickets',    icon: '🔧' },
  { label: 'Клиенты',  href: '/admin/users',      icon: '👥' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [open, setOpen] = useState(false);

  const nav = user?.role === 'Admin' ? adminNav : user?.role === 'Master' ? masterNav : clientNav;

  const handleLogout = async () => {
    try { await logout().unwrap(); } catch {}
    dispatch(clearCredentials());
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col ${mobile ? 'h-full pt-4' : 'sticky top-0 h-screen'} w-60 shrink-0 bg-navy px-3 py-6`}>
      <div className="mb-8 px-3"><Logo light /></div>
      <nav className="flex-1 space-y-1">
        {nav.map((item) => (
          <NavLink key={item.href} to={item.href} end={item.href.endsWith('dashboard')}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition
              ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="mb-3 px-3">
          <p className="text-xs text-white/40">Вы вошли как</p>
          <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-white/40">{user?.role}</p>
        </div>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-btn px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-danger transition">
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:block"><Sidebar /></div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-muted"><Menu size={22} /></button>
          <Logo />
        </div>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
