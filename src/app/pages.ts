export type PageId = "home" | "more";

export type NavigationItem = {
  id: PageId;
  label: string;
};

export const navigationItems: NavigationItem[] = [
  { id: "home", label: "Home" },
  { id: "more", label: "More" },
];
