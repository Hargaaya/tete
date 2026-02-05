import { createContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { Toast } from "../types";

type ToastContextType = {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "error") => {
      const id = String(++counterRef.current);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  return <ToastContext value={{ toasts, addToast, removeToast }}>{children}</ToastContext>;
}
