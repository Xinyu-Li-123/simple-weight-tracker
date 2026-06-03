import type { SidebarItem, UtilityPageId } from "../../app/pages";

type Props = {
  open: boolean;
  items: SidebarItem[];
  onClose: () => void;
  onSelect: (id: UtilityPageId) => void;
};

export function SidebarDrawer({ open, items, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        aria-label="More"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer__header">
          <h2>More</h2>
          <p>Utilities and data controls.</p>
        </div>
        <nav className="drawer__nav" aria-label="Utility pages">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="drawer__item"
              onClick={() => onSelect(item.id)}
            >
              <span className="drawer__item-label">{item.label}</span>
              <span className="drawer__item-description">{item.description}</span>
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}
