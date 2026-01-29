import React, { useEffect, useRef, useState } from 'react';

type Props = {
  id?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
};

const ComboBox: React.FC<Props> = ({ id, options, value, onChange, placeholder, className, error }) => {
  const [input, setInput] = useState<string>(value || '');
  const [open, setOpen] = useState<boolean>(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => setInput(value || ''), [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = input ? options.filter(o => o.toLowerCase().includes(input.toLowerCase())) : options.slice(0, 50);

  const select = (val: string) => {
    setInput(val);
    onChange(val);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setOpen(true);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && highlight >= 0 && highlight < filtered.length) {
        select(filtered[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        aria-autocomplete="list"
        type="text"
        value={input}
        placeholder={placeholder}
        className={`${className || ''} ${error ? 'border-red-500' : ''}`}
        onChange={(e) => { setInput(e.target.value); setOpen(true); setHighlight(-1); onChange(e.target.value); }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => { /* keep controlled by doc click */ }}
      />

      {open && filtered.length > 0 && (
        <ul id={id ? `${id}-listbox` : undefined} role="listbox" className="absolute z-50 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded mt-1 shadow-lg">
          {filtered.map((opt, idx) => (
            <li
              key={opt + idx}
              role="option"
              aria-selected={highlight === idx}
              onMouseDown={(e) => { e.preventDefault(); select(opt); }}
              onMouseEnter={() => setHighlight(idx)}
              className={`px-3 py-2 text-sm cursor-pointer ${highlight === idx ? 'bg-judiciary-100' : ''}`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComboBox;
