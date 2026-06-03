import { ChevronLeft, Menu } from "lucide-react";

type LeftAction =
  | {
      kind: "menu";
      onClick: () => void;
      label?: string;
    }
  | {
      kind: "back";
      onClick: () => void;
      label?: string;
    };

type TabItem<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  title?: string;
  leftAction?: LeftAction;
  tabs?: TabItem<T>[];
  activeTab?: T;
  onTabChange?: (tab: T) => void;
};

export function TopBar<T extends string>({ title, leftAction, tabs, activeTab, onTabChange }: Props<T>) {
  const menuAction = leftAction?.kind === "menu";
  const backAction = leftAction?.kind === "back";

  return (
    <header className="top-bar">
      <div className="top-bar__main">
        {leftAction ? (
          <button
            type="button"
            className="top-bar__icon-button"
            onClick={leftAction.onClick}
            aria-label={leftAction.label ?? (menuAction ? "Open navigation menu" : "Back")}
          >
            {menuAction ? <Menu aria-hidden="true" size={20} strokeWidth={2.4} /> : null}
            {backAction ? <ChevronLeft aria-hidden="true" size={20} strokeWidth={2.4} /> : null}
          </button>
        ) : (
          <span className="top-bar__spacer" aria-hidden="true" />
        )}
        {title ? <h1 className="top-bar__title">{title}</h1> : <span className="top-bar__title top-bar__title--empty" />}
        <span className="top-bar__spacer" aria-hidden="true" />
      </div>
      {tabs && tabs.length > 0 ? (
        <nav className="top-bar__tabs" aria-label="Page sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? "top-bar__tab top-bar__tab--active" : "top-bar__tab"}
              aria-pressed={tab.id === activeTab}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
