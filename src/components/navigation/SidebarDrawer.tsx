import { useTranslation, tUnsafe } from "@/i18n";
import type { SidebarItem, UtilityPageId } from "@/app/pages";

type Props = {
  open: boolean;
  items: SidebarItem[];
  onClose: () => void;
  onSelect: (id: UtilityPageId) => void;
};

export function SidebarDrawer({ open, items, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        aria-label={t("sidebar.title")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer__header">
        </div>
        <nav className="drawer__nav" aria-label="Utility pages">
          {items.map((item) => {
            const kb = itemKB(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className="drawer__item"
                onClick={() => onSelect(item.id)}
              >
                <span className="drawer__item-label">{tUnsafe(`sidebar.${kb}`)}</span>
                <span className="drawer__item-description">{tUnsafe(`sidebar.${kb}Desc`)}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

function itemKB(id: UtilityPageId): string {
  if (id === "data-safety") return "dataSafety";
  if (id === "backup-export") return "backupExport";
  if (id === "settings") return "settings";
  return id;
}
