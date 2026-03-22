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
  const baseStyles = 'rounded-xl backdrop-blur-xl';

  const variantStyles = {
    default: 'bg-slate-900/40 border border-white/10',
    gradient: 'bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-white/10',
    bordered: 'bg-slate-900/30 border border-cyan-500/20 shadow-lg shadow-cyan-500/5',
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
