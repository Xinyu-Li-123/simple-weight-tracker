import { bottomNavItems, recordAction, type RootPageId } from "@/app/pages";

type Props = {
  activePage: RootPageId;
  onNavigate: (page: RootPageId) => void;
  onRecord: () => void;
};

export function BottomNav({ activePage, onNavigate, onRecord }: Props) {
  const RecordIcon = recordAction.icon;

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {bottomNavItems.slice(0, 1).map((item) => (
        <button
          key={item.id}
          type="button"
          className={activePage === item.id ? "active" : ""}
          aria-pressed={activePage === item.id}
          onClick={() => onNavigate(item.id)}
        >
          <item.icon className="bottom-nav__icon" aria-hidden="true" strokeWidth={2.2} />
          <span className="bottom-nav__label">{item.label}</span>
        </button>
      ))}
      <button type="button" className="bottom-nav__action" onClick={onRecord} aria-label={recordAction.label}>
        <span className="bottom-nav__action-badge">
          <RecordIcon className="bottom-nav__icon bottom-nav__icon--action" aria-hidden="true" strokeWidth={2.4} />
        </span>
      </button>
      {bottomNavItems.slice(1).map((item) => (
        <button
          key={item.id}
          type="button"
          className={activePage === item.id ? "active" : ""}
          aria-pressed={activePage === item.id}
          onClick={() => onNavigate(item.id)}
        >
          <item.icon className="bottom-nav__icon" aria-hidden="true" strokeWidth={2.2} />
          <span className="bottom-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
