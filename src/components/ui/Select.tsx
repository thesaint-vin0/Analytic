import { clsx } from '../../utils/clsx';

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  className?: string;
  label?: string;
}

export function Select({ value, onChange, options, className, label }: SelectProps) {
  return (
    <label className={clsx('flex flex-col gap-1', className)}>
      {label && <span className="text-xs text-muted">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="surface-2 border border-border rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
