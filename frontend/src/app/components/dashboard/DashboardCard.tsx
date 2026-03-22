import { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'bordered';
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function DashboardCard({
  children,
  variant = 'default',
  className = '',
  padding = 'md',
}: DashboardCardProps) {
  const baseStyles = 'rounded-xl';

  const variantStyles = {
    default: 'bg-card border border-border',
    gradient:
      'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border border-border',
    bordered: 'bg-card border border-cyan-500/20 shadow-lg shadow-cyan-500/5',
  };

  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
