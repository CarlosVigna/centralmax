import { useEffect } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-primary text-white',
  warning: 'bg-warning text-neutral-900',
};

export function Toast({ message, variant = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed right-4 top-4 z-50 rounded-md px-4 py-3 text-sm shadow-lg ${VARIANT_CLASSES[variant]}`}>
      {message}
    </div>
  );
}
