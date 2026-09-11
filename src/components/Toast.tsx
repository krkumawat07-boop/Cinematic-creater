import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 text-xs animate-in slide-in-from-bottom-2 fade-in backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
              : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-100'
                : 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1 leading-snug">{toast.message}</div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
