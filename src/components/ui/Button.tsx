import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.98]',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm transition-all active:scale-[0.98]',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 transition-all active:scale-[0.98]',
      ghost: 'hover:bg-slate-100 transition-all active:scale-[0.98]',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
      md: 'px-6 py-3 text-sm font-semibold rounded-xl',
      lg: 'px-8 py-4 text-base font-bold rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button };
