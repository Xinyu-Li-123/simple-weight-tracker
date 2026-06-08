import { ReactNode, useEffect, useRef, useState } from "react";
import { ToastViewport } from "@/toast/ToastViewport";
import type { Toast, ToastInput } from "@/toast/toastTypes";
import { ToastContext } from "@/toast/useToast";

const DEFAULT_TOAST_DURATION_MS = 3000;
const DEFAULT_TOAST_VARIANT = "info";

type Props = {
  children: ReactNode;
};

export function ToastProvider({ children }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef(new Map<string, number>());

  function dismissToast(id: string) {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast(input: ToastInput | string) {
    const toastInput = typeof input === "string" ? { message: input } : input;
    const toast: Toast = {
      id: crypto.randomUUID(),
      message: toastInput.message,
      createdAt: Date.now(),
      durationMs: toastInput.durationMs ?? DEFAULT_TOAST_DURATION_MS,
      variant: toastInput.variant ?? DEFAULT_TOAST_VARIANT,
    };

    setToasts((current) => [toast, ...current]);

    const timer = window.setTimeout(() => {
      dismissToast(toast.id);
    }, toast.durationMs);

    timersRef.current.set(toast.id, timer);
  }

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
