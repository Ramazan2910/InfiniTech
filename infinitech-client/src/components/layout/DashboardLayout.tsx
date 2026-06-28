import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { clearCredentials } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../api/authApi';
import { LogOut, Menu, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NavItem { label: string; href: string; icon: string }

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [open, setOpen] = useState(false);

  const clientNav: NavItem[] = [
    { label: t('admin.dashboard'), href: '/client/dashboard', icon: '🏠' },
    { label: t('orders.title'),    href: '/client/orders',    icon: '📦' },
    { label: t('repairs.title'),   href: '/client/repairs',   icon: '🔧' },
    { label: t('cart.title'),      href: '/client/cart',      icon: '🛒' },
  ];
  const masterNav: NavItem[] = [
    { label: t('master.title'),         href: '/master/dashboard', icon: '📊' },
    { label: t('master.activeTickets'), href: '/master/tickets',   icon: '🔧' },
  ];
  const adminNav: NavItem[] = [
    { label: t('admin.dashboard'),  href: '/admin/dashboard', icon: '📊' },
    { label: t('admin.products'),   href: '/admin/products',  icon: '📦' },
    { label: t('admin.orders'),     href: '/admin/orders',    icon: '🛍️' },
    { label: t('admin.tickets'),    href: '/admin/tickets',   icon: '🔧' },
    { label: t('admin.users'),      href: '/admin/users',     icon: '👥' },
  ];

  const nav = user?.role === 'Admin' ? adminNav : user?.role === 'Master' ? masterNav : clientNav;
  const settingsHref = user?.role === 'Admin' ? '/admin/settings' : user?.role === 'Master' ? '/master/settings' : '/client/settings';

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
      <div className="border-t border-white/10 pt-4 mt-4 space-y-1">
        <NavLink to={settingsHref} onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-btn px-3 py-2 text-sm transition
            ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
          <Settings size={15} /> {t('settings.title')}
        </NavLink>
        <div className="px-3 pt-2">
          <p className="text-xs text-white/40">{t('common.updated')}</p>
          <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-white/40">{user?.role}</p>
        </div>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-btn px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-danger transition">
          <LogOut size={16} /> {t('nav.logout')}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:block"><Sidebar /></div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full"><Sidebar mobile /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-muted"><Menu size={22} /></button>
          <Logo />
        </div>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
