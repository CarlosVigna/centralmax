import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            error ? 'border-danger focus:ring-danger' : 'border-neutral-300 focus:ring-primary-light'
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
