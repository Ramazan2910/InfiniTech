interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'navy' | 'success' | 'warning' | 'danger' | 'muted' | 'xlight';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  blue:    'bg-blue-xlight text-blue',
  navy:    'bg-navy text-white',
  success: 'bg-green-100 text-success',
  warning: 'bg-amber-100 text-warning',
  danger:  'bg-red-100 text-danger',
  muted:   'bg-gray-100 text-muted',
  xlight:  'bg-blue-xlight text-navy',
};

export function Badge({ children, variant = 'blue', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-chip font-medium
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
