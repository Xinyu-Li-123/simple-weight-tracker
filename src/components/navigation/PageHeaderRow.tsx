import { ChevronLeft, Menu } from "lucide-react";
import type { ReactNode } from "react";

export type HeaderAction =
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

type Props = {
  leftAction: HeaderAction;
  children?: ReactNode;
};

export function PageHeaderRow({ leftAction, children }: Props) {
  const menuAction = leftAction.kind === "menu";

  return (
    <header className="page-header-row">
      <button
        type="button"
        className="page-header-row__icon-button"
        onClick={leftAction.onClick}
        aria-label={leftAction.label ?? (menuAction ? "Open navigation menu" : "Back")}
      >
        {menuAction ? <Menu aria-hidden="true" size={20} strokeWidth={2.4} /> : null}
        {!menuAction ? <ChevronLeft aria-hidden="true" size={20} strokeWidth={2.4} /> : null}
      </button>
      <div className="page-header-row__content">{children}</div>
    </header>
  );
}
