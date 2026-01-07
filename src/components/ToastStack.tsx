export type Toast = {
  id: string;
  message: string;
  tone?: "info" | "success" | "error";
};

type ToastStackProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

function toneStyles(tone: Toast["tone"]) {
  switch (tone) {
    case "success":
      return "bg-green-50 border-green-200 text-green-800";
    case "error":
      return "bg-red-50 border-red-200 text-red-800";
    default:
      return "bg-slate-50 border-slate-200 text-slate-800";
  }
}

function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-md ${toneStyles(
            toast.tone
          )}`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
