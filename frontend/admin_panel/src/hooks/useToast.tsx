import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showSuccess: () => {}, showError: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'success' ? 3000 : 5000);
  }, []);

  const showSuccess = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message: string) => addToast(message, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      {toasts.length > 0 && (
        <ToastList toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      )}
    </ToastContext.Provider>
  );
}

function ToastList({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            width: 320,
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${t.type === 'success' ? 'var(--green-700)' : '#DC2626'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 13,
            color: 'var(--text-primary)',
          }}
        >
          <span>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
