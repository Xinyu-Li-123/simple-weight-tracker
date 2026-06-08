import { Pencil, Trash2 } from "lucide-react";
import type { WeightEntry } from "@/types/weight";

type Props = {
  entry: WeightEntry;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showSummary?: boolean;
  noteExpanded?: boolean;
  className?: string;
};

export function WeightRecordCard({
  entry,
  onOpen,
  onEdit,
  onDelete,
  showSummary = true,
  noteExpanded = false,
  className,
}: Props) {
  const classes = ["record-card", className].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      {showSummary ? (
        onOpen ? (
          <button type="button" className="record-card__main record-card__main--button" onClick={onOpen}>
            <span className="record-card__date">{entry.date}</span>
            <strong className="record-card__weight">{entry.weight} kg</strong>
            {entry.note ? (
              <small className={noteExpanded ? "record-card__note record-card__note--expanded" : "record-card__note"}>
                {entry.note}
              </small>
            ) : null}
          </button>
        ) : (
          <div className="record-card__main">
            <span className="record-card__date">{entry.date}</span>
            <strong className="record-card__weight">{entry.weight} kg</strong>
            {entry.note ? (
              <small className={noteExpanded ? "record-card__note record-card__note--expanded" : "record-card__note"}>
                {entry.note}
              </small>
            ) : null}
          </div>
        )
      ) : null}
      {(onEdit || onDelete) ? (
        <div className="record-card__actions">
          {onEdit ? (
            <button type="button" className="ghost record-card__icon-button" onClick={onEdit} aria-label={`Edit record for ${entry.date}`}>
              <Pencil aria-hidden="true" size={16} strokeWidth={2.2} />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="ghost ghost-danger record-card__icon-button record-card__icon-button--danger"
              onClick={onDelete}
              aria-label={`Delete record for ${entry.date}`}
            >
              <Trash2 aria-hidden="true" size={16} strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
