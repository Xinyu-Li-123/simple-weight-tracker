import { Ellipsis, House, SquarePen, type LucideIcon } from "lucide-react";

export type PageId = "home" | "more";

export type NavigationItem = {
  id: PageId;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "more", label: "More", icon: Ellipsis },
];

export const recordAction = {
  label: "Record",
  icon: SquarePen,
};
