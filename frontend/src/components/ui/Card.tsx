import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'flat' | 'interactive';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-white border border-neutral-300 shadow-sm',
  flat: 'bg-white',
  interactive: 'bg-white border border-neutral-300 shadow-sm hover:shadow-md transition cursor-pointer',
};

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  return (
    <div className={`rounded-lg p-4 ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
