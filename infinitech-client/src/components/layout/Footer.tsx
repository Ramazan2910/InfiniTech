import { Logo } from './Logo';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer id="footer" className="bg-navy text-white">
      <div className="h-0.5 bg-gradient-to-r from-blue via-blue-light to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo light />
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Техника и сервис в одном месте — онлайн и в сервисном центре Баку.
            </p>
            <div className="mt-5 flex gap-3">
              {['📷', '👍', '💼'].map((icon, i) => (
                <button key={i} className="flex h-9 w-9 items-center justify-center rounded-btn bg-white/10 text-lg hover:bg-white/20 transition">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white/40">Навигация</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              {[['/', 'Главная'], ['/shop', 'Каталог'], ['/client/repairs', 'Сервис'], ['/#about', 'О нас'], ['/#contact', 'Контакты']].map(([href, label]) => (
                <li key={href}><Link to={href} className="hover:text-white transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white/40">Сервис</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              {[['Сдать в ремонт', '/client/repairs'], ['Статус заявки', '/client/repairs'], ['Гарантия', '/'], ['FAQ', '/']].map(([label, href]) => (
                <li key={label}><Link to={href} className="hover:text-white transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white/40">Контакты</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-blue" /><span>Füzuli küçəsi 37, Bakı</span></li>
              <li className="flex gap-2"><Phone size={16} className="shrink-0 text-blue" /><span>+994 12 526 36 40</span></li>
              <li className="flex gap-2"><Mail size={16} className="shrink-0 text-blue" /><span>info@infinitech.az</span></li>
              <li className="flex gap-2"><Clock size={16} className="shrink-0 text-blue" /><span>Пн–Пт 09:00–18:00</span></li>
            </ul>
          </div>
        </div>

        <hr className="mt-12 border-white/10" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-white/40 sm:flex-row">
          <span>© 2025 InfiniTech. Bütün hüquqlar qorunur.</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-white transition">Privacy</Link>
            <Link to="/" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
