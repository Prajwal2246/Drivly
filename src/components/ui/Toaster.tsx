'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// Replaces alert(): non-blocking, announced to screen readers. Call toast() from any client code. See #022.
type Tone = 'success' | 'error';
type Item = { id: number; tone: Tone; message: string };
const EVENT = 'drivly:toast';

export function toast(message: string, tone: Tone = 'success') {
  window.dispatchEvent(new CustomEvent<Omit<Item, 'id'>>(EVENT, { detail: { message, tone } }));
}

let nextId = 0;

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const item = { id: ++nextId, ...(e as CustomEvent<Omit<Item, 'id'>>).detail };
      setItems(prev => [...prev, item]);
      // Errors stay until dismissed so they can't be missed; confirmations fade after 4s.
      if (item.tone === 'success') setTimeout(() => setItems(prev => prev.filter(i => i.id !== item.id)), 4000);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  const dismiss = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-96 pointer-events-none">
      {items.map(item => (
        <div
          key={item.id}
          role={item.tone === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[14px] shadow-raised text-sm ${
            item.tone === 'error' ? 'bg-danger-soft text-danger-ink' : 'bg-surface text-ink border border-line'
          }`}
        >
          {item.tone === 'error'
            ? <AlertCircle aria-hidden className="w-5 h-5 shrink-0" />
            : <CheckCircle2 aria-hidden className="w-5 h-5 shrink-0 text-success-ink" />}
          <span className="flex-1 font-medium leading-snug">{item.message}</span>
          <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer">
            <X aria-hidden className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
