import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../api/productsApi';
import { useGetProductsQuery } from '../../api/productsApi';
import { ProductCard } from '../../components/shared/ProductCard';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Wrench, CheckCircle, Package, Zap, ChevronRight } from 'lucide-react';

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-navy to-[#1e3a6e] pt-20">
      {/* BG grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, #4FACDE 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative mx-auto max-w-7xl w-full px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="animate-float-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-chip border border-blue/30 px-4 py-1.5 text-sm text-blue">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
              Авторизованный сервисный центр · Баку
            </div>
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-white md:text-6xl">
              Техника<br />
              работает.<br />
              <span className="text-blue">Мы позаботимся</span><br />
              об остальном.
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-white/70">
              Продажа комплектующих и профессиональный ремонт в одном месте — онлайн и в сервисном центре Баку.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/shop')} leftIcon={<Package size={18} />}>
                Смотреть каталог
              </Button>
              <Button size="lg" variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50"
                onClick={() => navigate('/client/repairs')}
                leftIcon={<Wrench size={18} />}>
                Сдать в ремонт
              </Button>
            </div>
          </div>

          {/* Decorative ∞ */}
          <div className="hidden lg:flex items-center justify-center relative h-[420px]">
            <svg viewBox="0 0 300 200" className="w-full max-w-xs animate-pulse-glow" fill="none">
              <defs>
                <linearGradient id="infGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4FACDE" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7DCBF0" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path d="M150 100 C150 60 120 30 80 30 C40 30 20 60 20 100 C20 140 40 170 80 170 C120 170 150 140 150 100 Z
                       M150 100 C150 60 180 30 220 30 C260 30 280 60 280 100 C280 140 260 170 220 170 C180 170 150 140 150 100 Z"
                fill="url(#infGrad)" stroke="#4FACDE" strokeWidth="2" />
            </svg>
            {/* Floating stat cards */}
            <div className="absolute top-8 right-0 rounded-card bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 animate-float-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xs text-white/60">Ремонтов</p>
              <p className="font-display text-2xl font-bold text-white">2,400+</p>
            </div>
            <div className="absolute bottom-8 left-0 rounded-card bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 animate-float-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-xs text-white/60">Позиций в каталоге</p>
              <p className="font-display text-2xl font-bold text-white">850+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Promo Strip ─────────────────────────────────────────────────────────────
function PromoStrip() {
  const items = [
    { icon: <Wrench size={20} />, text: 'Авторизованный сервисный центр' },
    { icon: <CheckCircle size={20} />, text: 'Гарантия на все товары' },
    { icon: <Package size={20} />, text: 'Новые и б/у комплектующие' },
    { icon: <Zap size={20} />, text: 'Диагностика от 24 часов' },
  ];
  return (
    <div className="bg-navy py-5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-blue/20 text-blue">
                {item.icon}
              </div>
              <span className="text-sm font-medium text-white/80">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
function CategoriesSection() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useGetCategoriesQuery();
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-10 font-display text-3xl font-bold text-text">Категории товаров</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse h-28 rounded-card bg-gray-100" />
              ))
            : categories?.map((cat) => (
                <button key={cat.id}
                  onClick={() => navigate(`/shop?categoryId=${cat.id}`)}
                  className="group relative overflow-hidden rounded-card bg-gradient-to-br from-navy to-navy-mid p-5 text-left
                    transition-all duration-200 hover:scale-[1.03] hover:shadow-card-lg">
                  <div className="mb-3 text-4xl">{cat.iconEmoji}</div>
                  <p className="font-display text-sm font-semibold text-white">{cat.name}</p>
                  {cat.productCount > 0 && (
                    <p className="text-xs text-white/50">{cat.productCount} товаров</p>
                  )}
                  <ArrowRight size={14} className="absolute right-4 top-4 text-white/30 transition group-hover:text-blue group-hover:translate-x-0.5" />
                </button>
              ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Products ────────────────────────────────────────────────────────
function FeaturedProducts() {
  const navigate = useNavigate();
  const [condition, setCondition] = useState<'' | 'New' | 'Used'>('');
  const { data, isLoading } = useGetProductsQuery({ page: 1, pageSize: 8, condition: condition || undefined });
  const chips = [{ label: 'Все', value: '' as const }, { label: 'Новое', value: 'New' as const }, { label: 'Б/У', value: 'Used' as const }];

  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-text">Популярные товары</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {chips.map((c) => (
                <button key={c.value} onClick={() => setCondition(c.value)}
                  className={`rounded-chip px-4 py-1.5 text-sm font-medium transition
                    ${condition === c.value ? 'bg-blue text-white' : 'bg-surface text-muted border border-border hover:border-blue hover:text-navy'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/shop')}
              className="flex items-center gap-1 text-sm font-medium text-blue hover:text-blue-light transition">
              Весь каталог <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Split Promo ──────────────────────────────────────────────────────────────
function SplitPromo() {
  const navigate = useNavigate();
  const { data } = useGetProductsQuery({ page: 1, pageSize: 4 });

  const ticketStatuses = [
    { label: 'Диагностика', color: 'text-blue bg-blue-xlight' },
    { label: 'В ремонте',   color: 'text-warning bg-amber-50' },
    { label: 'Готово',      color: 'text-success bg-green-50' },
  ];
  const [demoIdx, setDemoIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDemoIdx((i) => (i + 1) % 3), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Service */}
      <div className="bg-navy px-8 py-16 md:px-14">
        <span className="text-xs font-bold uppercase tracking-widest text-blue">Сервисный центр</span>
        <h2 className="mt-3 mb-4 font-display text-3xl font-bold text-white leading-tight">
          Сломалось? Починим.<br />Отслеживайте онлайн.
        </h2>
        <p className="mb-8 text-sm text-white/60 leading-relaxed">
          Оставьте заявку онлайн, привезите устройство и следите за статусом прямо из личного кабинета.
        </p>
        {/* Demo ticket */}
        <div className="mb-8 rounded-card bg-white/10 p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/80">Заявка #1042 · ASUS ZenBook</span>
            <span className={`text-xs font-semibold rounded-chip px-2.5 py-0.5 ${ticketStatuses[demoIdx].color}`}>
              {ticketStatuses[demoIdx].label}
            </span>
          </div>
          <div className="flex gap-1">
            {ticketStatuses.map((_s, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= demoIdx ? 'bg-blue' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
        <Button onClick={() => navigate('/client/repairs')} leftIcon={<Wrench size={16} />}>
          Создать заявку
        </Button>
      </div>

      {/* Shop */}
      <div className="bg-surface px-8 py-16 md:px-14">
        <span className="text-xs font-bold uppercase tracking-widest text-navy">Магазин комплектующих</span>
        <h2 className="mt-3 mb-4 font-display text-3xl font-bold text-navy leading-tight">
          Новые и б/у запчасти с гарантией
        </h2>
        <p className="mb-8 text-sm text-muted leading-relaxed">
          Широкий ассортимент комплектующих для любых задач — от бюджетных до профессиональных решений.
        </p>
        <div className="mb-8 grid grid-cols-2 gap-3">
          {data?.items.slice(0, 4).map((p) => (
            <div key={p.id} className="rounded-card border border-border p-3">
              <div className="text-2xl mb-1">{p.categoryEmoji}</div>
              <p className="text-xs font-semibold text-text line-clamp-1">{p.name}</p>
              <p className="text-xs text-blue font-bold">₼{p.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={() => navigate('/shop')} leftIcon={<Package size={16} />}>
          Перейти в каталог
        </Button>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        const duration = 1500;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          setValue(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="font-display text-4xl font-bold text-navy">{value.toLocaleString()}{suffix}</div>;
}

function StatsSection() {
  const stats = [
    { label: 'Ремонтов выполнено', target: 2400, suffix: '+' },
    { label: 'Позиций в каталоге', target: 850,  suffix: '+' },
    { label: 'Довольных клиентов', target: 98,   suffix: '%' },
    { label: 'Срок диагностики',   target: 24,   suffix: 'ч' },
  ];
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-card bg-bg p-6 text-center shadow-card">
              <AnimatedCounter target={s.target} suffix={s.suffix} />
              <p className="mt-2 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const [tab, setTab] = useState<'buy' | 'repair'>('buy');
  const buySteps = [
    { icon: '🔍', title: 'Выберите товар', desc: 'Найдите нужный товар в каталоге' },
    { icon: '🛒', title: 'Добавьте в корзину', desc: 'Сохраните выбранные позиции' },
    { icon: '📋', title: 'Оформите заказ', desc: 'Укажите адрес доставки' },
    { icon: '📦', title: 'Получите товар', desc: 'Доставим в удобное время' },
  ];
  const repairSteps = [
    { icon: '✍️', title: 'Заявка онлайн', desc: 'Опишите проблему устройства' },
    { icon: '🚗', title: 'Привезите устройство', desc: 'В наш сервисный центр' },
    { icon: '📱', title: 'Следите за статусом', desc: 'В личном кабинете онлайн' },
    { icon: '✅', title: 'Заберите', desc: 'Отремонтированное устройство' },
  ];
  const steps = tab === 'buy' ? buySteps : repairSteps;

  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 font-display text-3xl font-bold text-center text-text">Как это работает</h2>
        <div className="mb-10 flex justify-center gap-2">
          {(['buy', 'repair'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-chip px-5 py-2 text-sm font-medium transition
                ${tab === t ? 'bg-navy text-white' : 'bg-surface text-muted border border-border hover:border-navy'}`}>
              {t === 'buy' ? 'Купить товар' : 'Сдать в ремонт'}
            </button>
          ))}
        </div>
        <div className="animate-fade-tab grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-2xl shadow-card">
                {s.icon}
              </div>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-blue text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {i < 3 && <div className="absolute top-7 left-[calc(50%+28px)] right-[-50%] h-0.5 border-t-2 border-dashed border-border hidden lg:block" />}
              <h4 className="mb-1 font-display font-semibold text-text">{s.title}</h4>
              <p className="text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
function VendorsStrip() {
  const brands = ['Apple', 'Samsung', 'ASUS', 'Lenovo', 'HP', 'Dell', 'AMD', 'NVIDIA', 'Kingston', 'Logitech'];
  const doubled = [...brands, ...brands];
  return (
    <section className="bg-surface py-14">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center font-display text-xl font-semibold text-text/60">Работаем с ведущими брендами</h2>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee gap-6">
            {doubled.map((brand, i) => (
              <div key={i} className="flex h-12 w-32 shrink-0 items-center justify-center rounded-chip border border-border px-4
                text-sm font-semibold text-muted grayscale transition hover:grayscale-0 hover:border-blue hover:text-navy">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <>
      <Hero />
      <PromoStrip />
      <CategoriesSection />
      <FeaturedProducts />
      <SplitPromo />
      <StatsSection />
      <HowItWorks />
      <VendorsStrip />
    </>
  );
}
