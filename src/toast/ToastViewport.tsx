import { CheckCircle2, Info, OctagonAlert, TriangleAlert, X } from "lucide-react";
import type { CSSProperties } from "react";
import type { Toast } from "@/toast/toastTypes";

type Props = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

function iconForToastVariant(toast: Toast) {
  if (toast.variant === "success") return CheckCircle2;
  if (toast.variant === "error") return OctagonAlert;
  if (toast.variant === "warning") return TriangleAlert;
  return Info;
}

export function ToastViewport({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = iconForToastVariant(toast);

        return (
          <section
            key={toast.id}
            className="toast"
            data-variant={toast.variant}
            style={{ "--toast-duration": `${toast.durationMs}ms` } as CSSProperties}
          >
            <div className="toast__body">
              <div className="toast__content">
                <Icon className="toast__icon" aria-hidden="true" size={18} strokeWidth={2.3} />
                <p>{toast.message}</p>
              </div>
              <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
                <X aria-hidden="true" size={16} strokeWidth={2.4} />
              </button>
            </div>
            <span className="toast__progress" aria-hidden="true" />
          </section>
        );
      })}
    </div>
  );
}
