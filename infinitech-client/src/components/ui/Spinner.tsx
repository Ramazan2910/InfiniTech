import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-blue ${className}`} />;
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
