import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            error ? 'border-danger focus:ring-danger' : 'border-neutral-300 focus:ring-primary-light'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {!error && helperText && <span className="text-xs text-neutral-600">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
