import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</span>
        )}
        <input
          id={inputId}
          {...props}
          className={`w-full rounded-btn border bg-surface px-3 py-2.5 text-sm text-text outline-none transition
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-danger focus:ring-1 focus:ring-danger' : 'border-border focus:border-blue focus:ring-1 focus:ring-blue'}
            placeholder:text-muted
            ${className}`}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
