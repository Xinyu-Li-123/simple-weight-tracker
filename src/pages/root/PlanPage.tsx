import { PageHeaderRow } from "../../components/navigation/PageHeaderRow";

type Props = {
  onOpenSidebar: () => void;
};

export function PlanPage({ onOpenSidebar }: Props) {
  return (
    <>
      <PageHeaderRow leftAction={{ kind: "menu", onClick: onOpenSidebar }} />
      <section className="card placeholder-card">
        <h2>Plan</h2>
        <p className="muted">Profile, target weight, and milestone planning will live here in a later slice.</p>
      </section>
    </>
  );
}
