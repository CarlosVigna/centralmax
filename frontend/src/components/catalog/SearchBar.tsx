import type { ChangeEvent } from 'react';
import { Input } from '../ui/Input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return <Input placeholder="Buscar produtos..." value={value} onChange={handleChange} />;
}
