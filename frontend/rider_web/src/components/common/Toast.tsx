import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ToastItem = {
  id: string;
  type: "success" | "error";
  message: string;
};

const ToastContext = createContext<{
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  function show(type: ToastItem["type"], message: string) {
    const id = `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setItems((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, type === "success" ? 3000 : 5000);
  }

  const value = useMemo(
    () => ({
      showSuccess: (message: string) => show("success", message),
      showError: (message: string) => show("error", message),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000, display: "grid", gap: 10 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              minWidth: 240,
              maxWidth: 320,
              background: "#fff",
              border: "1px solid #E2E5DE",
              borderLeft: `4px solid ${item.type === "success" ? "#1A6B45" : "#DC2626"}`,
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              padding: "12px 14px",
              color: "#141A13",
              fontSize: 13,
            }}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
