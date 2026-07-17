import { clsx } from '../../utils/clsx';

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Input({ label, type = 'text', value, onChange, placeholder, disabled, className }: InputProps) {
  return (
    <label className={clsx('flex flex-col gap-1', className)}>
      {label && <span className="text-xs text-muted">{label}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
      />
    </label>
  );
}
