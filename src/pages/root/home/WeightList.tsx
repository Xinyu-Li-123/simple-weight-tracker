import { useTranslation } from "@/i18n";
import { WeightRecordCard } from "@/components/WeightRecordCard";
import type { WeightEntry } from "@/types/weight";

type Props = {
  entries: WeightEntry[];
  onOpenEntry: (entry: WeightEntry) => void;
  onEditEntry: (entry: WeightEntry) => void;
  onRequestDeleteEntry: (entry: WeightEntry) => void;
  title?: string;
  emptyMessage?: string;
};

export function WeightList({
  entries,
  onOpenEntry,
  onEditEntry,
  onRequestDeleteEntry,
}: Props) {
  const { t } = useTranslation();

  return (
    <div>
      {entries.length === 0 ? (
        <p className="muted">{t("history.noEntries")}</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <WeightRecordCard
                entry={entry}
                onOpen={() => onOpenEntry(entry)}
                onEdit={() => onEditEntry(entry)}
                onDelete={() => onRequestDeleteEntry(entry)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
