import { useNavigate } from 'react-router-dom';

export function Logo({ light = false }: { light?: boolean }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy shadow-sm">
        <span className="font-display text-xl font-bold leading-none text-blue">∞</span>
      </div>
      <span className={`font-display text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>
        INFINITECH
      </span>
    </button>
  );
}
