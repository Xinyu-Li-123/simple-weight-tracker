import { Ellipsis, House, SquarePen, type LucideIcon } from "lucide-react";

export type PageId = "home" | "record" | "more";

export type NavigationItem = {
  id: PageId;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "record", label: "Record", icon: SquarePen },
  { id: "more", label: "More", icon: Ellipsis },
];
