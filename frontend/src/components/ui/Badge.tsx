import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'purple';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-neutral-300/50 text-neutral-900',
  info: 'bg-primary-light/10 text-primary-light',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
