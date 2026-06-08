import { House, SquarePen, Target, type LucideIcon } from "lucide-react";

export type RootPageId = "home" | "plan";
export type UtilityPageId = "settings" | "data-safety" | "backup-export";

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

export const bottomNavItems: BottomNavItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "plan", label: "Plan", icon: Target },
];

export const sidebarItems: SidebarItem[] = [
  {
    id: "settings",
    label: "Settings",
    description: "Date, time, and app behavior preferences.",
  },
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

export const recordAction = {
  label: "Record",
  icon: SquarePen,
};
