import * as React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants: Record<string, string> = {
  default: 'border border-slate-200 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 font-medium',
  secondary: 'border border-slate-200 bg-white text-slate-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 font-medium',
  destructive: 'border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/60 dark:border-red-800 dark:text-red-300 font-semibold',
  outline: 'text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 font-semibold',
  info: 'border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 font-semibold',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300 font-semibold',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants | string;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none tracking-tight',
        badgeVariants[variant] || badgeVariants.default,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
