import { useEffect } from 'react';

export default function Toast({ message, tone = 'ok', onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, onDismiss, duration]);

  if (!message) return null;
  const color = tone === 'ok' ? 'border-[#7ee787] text-[#7ee787]' : 'border-[#ff8a80] text-[#ff8a80]';

  return (
    <div role="status" className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-md border bg-[#1A0E1C] px-4 py-3 text-sm shadow-lg ${color}`}>
      <div className="flex items-start gap-3">
        <span className="flex-1">{message}</span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-[#b5cbcb] hover:text-white">x</button>
      </div>
    </div>
  );
}