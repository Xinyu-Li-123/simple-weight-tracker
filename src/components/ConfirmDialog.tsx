import { useTranslation } from "@/i18n";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  busy = false,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="confirm-dialog-backdrop" onClick={busy ? undefined : onCancel}>
      <section
        className="confirm-dialog"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog__body">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="confirm-dialog__actions">
          <button type="button" className="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button type="button" className={tone === "danger" ? "danger" : undefined} onClick={() => void onConfirm()} disabled={busy}>
            {busy ? t("common.working") : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
