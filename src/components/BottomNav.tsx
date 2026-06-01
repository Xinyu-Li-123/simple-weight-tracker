import { navigationItems, type PageId } from "../app/pages";

type Props = {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
};

export function BottomNav({ activePage, onNavigate }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navigationItems.map((item) => (
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
