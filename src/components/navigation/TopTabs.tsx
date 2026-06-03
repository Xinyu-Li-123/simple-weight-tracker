type TabItem<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
};

export function TopTabs<T extends string>({ tabs, activeTab, onTabChange }: Props<T>) {
  return (
    <nav className="top-tabs" aria-label="Page sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === activeTab ? "top-tabs__tab top-tabs__tab--active" : "top-tabs__tab"}
          aria-pressed={tab.id === activeTab}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
