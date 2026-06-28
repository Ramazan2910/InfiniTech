import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { clearCredentials } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../api/authApi';
import { useGetCartQuery } from '../../api/cartApi';

const navLinks = [
  { label: 'Главная',  href: '/' },
  { label: 'Каталог',  href: '/shop' },
  { label: 'Сервис',   href: '/client/repairs' },
  { label: 'О нас',    href: '/#about' },
];

function dashboardFor(role?: string) {
  if (role === 'Admin')  return '/admin/dashboard';
  if (role === 'Master') return '/master/dashboard';
  return '/client/dashboard';
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [logout] = useLogoutMutation();
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated || user?.role !== 'Client' });

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    try { await logout().unwrap(); } catch {}
    dispatch(clearCredentials());
    navigate('/');
  };

  const navbarBg = isLanding && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-card';

  const linkColor = isLanding && !scrolled ? 'text-white/80 hover:text-white' : 'text-muted hover:text-navy';

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${navbarBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Logo light={isLanding && !scrolled} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} to={l.href}
                className={`text-sm font-medium transition-colors ${linkColor}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            {isAuthenticated && user?.role === 'Client' && (
              <button onClick={() => navigate('/client/cart')}
                className={`relative rounded-btn p-2 transition ${linkColor}`}>
                <ShoppingCart size={20} />
                {(cart?.itemCount ?? 0) > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-white">
                    {cart!.itemCount}
                  </span>
                )}
              </button>
            )}

            {/* User */}
            {isAuthenticated ? (
              <div ref={dropRef} className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className={`flex items-center gap-1.5 rounded-btn px-3 py-2 text-sm font-medium transition ${linkColor}`}>
                  <User size={16} />
                  <span className="hidden sm:inline">{user?.firstName}</span>
                  <ChevronDown size={14} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-card bg-surface shadow-card-lg border border-border py-1">
                    <button onClick={() => { navigate(dashboardFor(user?.role)); setDropOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text hover:bg-bg">
                      <LayoutDashboard size={14} /> Личный кабинет
                    </button>
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50">
                      <LogOut size={14} /> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/auth/login')}
                className={`rounded-btn border px-4 py-2 text-sm font-medium transition
                  ${isLanding && !scrolled
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-navy text-navy hover:bg-navy hover:text-white'}`}>
                Войти
              </button>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden rounded-btn p-2 transition ${linkColor}`}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="relative ml-auto w-72 bg-surface h-full shadow-card-lg flex flex-col pt-20 px-6 gap-2">
            {navLinks.map((l) => (
              <Link key={l.href} to={l.href} onClick={() => setMenuOpen(false)}
                className="rounded-btn px-3 py-2.5 text-sm font-medium text-text hover:bg-bg">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
