import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'accent' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue-light shadow-sm hover:shadow-md',
  accent:  'bg-navy text-white hover:bg-navy-mid shadow-sm hover:shadow-md',
  ghost:   'bg-transparent text-navy hover:bg-blue-xlight',
  outline: 'border border-navy text-navy bg-transparent hover:bg-navy hover:text-white',
  danger:  'bg-danger text-white hover:opacity-90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-all duration-150
        ${variantClasses[variant]} ${sizeClasses[size]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
    </button>
  );
}
