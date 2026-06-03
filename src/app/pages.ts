import { House, SquarePen, Target, type LucideIcon } from "lucide-react";

export type RootPageId = "home" | "plan";
export type UtilityPageId = "data-safety" | "backup-export";
export type HomeTabId = "dashboard" | "history";

export type BottomNavItem = {
  id: RootPageId;
  label: string;
  icon: LucideIcon;
};

export type SidebarItem = {
  id: UtilityPageId;
  label: string;
  description: string;
};

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

export const bottomNavItems: BottomNavItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "plan", label: "Plan", icon: Target },
];

export const sidebarItems: SidebarItem[] = [
  {
    id: "data-safety",
    label: "Data Safety",
    description: "Storage mode and persistence details.",
  },
  {
    id: "backup-export",
    label: "Backup and export",
    description: "Import backups and export records.",
  },
];

export const homeTabs: TabItem<HomeTabId>[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "history", label: "History" },
];

export const recordAction = {
  label: "Record",
  icon: SquarePen,
};
