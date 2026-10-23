'use client';
import { useEffect, useRef, useState } from 'react';
import { fetchEmpList, EmpUser } from '@/app/manager/emp/service/serviceEmp';

interface Props {
  label?: string;
  icon?: string;
  value: string;
  onChange: (val: string) => void;
  onSelect?: (emp: EmpUser) => void;
  placeholder?: string;
}

export default function AutocompleteInput({ label, icon, value, onChange, onSelect, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<EmpUser[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อ click ข้างนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetchEmpList({ name: val, limit: 20, page: 1 });
        // deduplicate ตาม hr_emp_id (เพราะ join attendance ทำให้คนเดียวมีหลาย row)
        const seen = new Set<string>();
        const unique = (res.data ?? []).filter(e => {
          if (seen.has(e.hr_emp_id)) return false;
          seen.add(e.hr_emp_id); return true;
        }).slice(0, 6);
        setSuggestions(unique);
        setOpen(unique.length > 0);
      } catch { setSuggestions([]); setOpen(false); }
    }, 300);
  };

  const handleSelect = (emp: EmpUser) => {
    onChange(emp.full_name);
    setSuggestions([]);
    setOpen(false);
    onSelect?.(emp);
  };

  return (
    <div ref={wrapRef} className="w-full max-w-full mx-auto relative">
      {label && <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>}
      <div className="relative hover:scale-105 transition-all duration-300">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl"
            style={{ fontVariationSettings: "'wght' 700" }}>
            {icon}
          </span>
        )}
        <input
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && setOpen(false)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-center font-bold text-black bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 placeholder:text-gray-600`}
          autoComplete="off"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(emp => (
            <li key={emp.hr_emp_id}
              onMouseDown={() => handleSelect(emp)}
              className="px-4 py-2.5 cursor-pointer hover:bg-indigo-50 border-b border-gray-50 last:border-0">
              <p className="text-sm font-bold text-gray-800">{emp.full_name}</p>
              <p className="text-xs font-bold text-gray-400">{emp.dept_name ?? '-'} · รหัส {emp.hr_emp_id}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
