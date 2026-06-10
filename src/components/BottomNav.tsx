import { useTranslation, tUnsafe } from "@/i18n";
import { bottomNavItems, recordAction, type RootPageId } from "@/app/pages";

type Props = {
  activePage: RootPageId;
  onNavigate: (page: RootPageId) => void;
  onRecord: () => void;
};

export function BottomNav({ activePage, onNavigate, onRecord }: Props) {
  const { t } = useTranslation();
  const RecordIcon = recordAction.icon;

  return (
    <nav className="bottom-nav" aria-label={t("nav.primaryAriaLabel")}>
      {bottomNavItems.slice(0, 1).map((item) => (
        <button
          key={item.id}
          type="button"
          className={activePage === item.id ? "active" : ""}
          aria-pressed={activePage === item.id}
          onClick={() => onNavigate(item.id)}
        >
          <item.icon className="bottom-nav__icon" aria-hidden="true" strokeWidth={2.2} />
          <span className="bottom-nav__label">{tUnsafe(`nav.${item.id}`)}</span>
        </button>
      ))}
      <button type="button" className="bottom-nav__action" onClick={onRecord} aria-label={t("nav.record")}>
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
          <span className="bottom-nav__label">{tUnsafe(`nav.${item.id}`)}</span>
        </button>
      ))}
    </nav>
  );
}
