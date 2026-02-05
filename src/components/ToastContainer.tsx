import { useToast } from "../hooks/useToast";

const TYPE_STYLES = {
  error: "bg-red-600",
  success: "bg-green-600",
  info: "bg-slate-700",
} as const;

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90%] max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${TYPE_STYLES[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between animate-[slideDown_0.2s_ease-out]`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-3 text-white/70 hover:text-white" aria-label="Dismiss notification">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
