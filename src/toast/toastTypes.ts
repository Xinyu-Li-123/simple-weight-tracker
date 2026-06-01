export type ToastVariant = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  createdAt: number;
  durationMs: number;
  variant: ToastVariant;
};

export type ToastInput = {
  message: string;
  durationMs?: number;
  variant?: ToastVariant;
};

export type ToastContextValue = {
  pushToast: (input: ToastInput | string) => void;
  dismissToast: (id: string) => void;
};
