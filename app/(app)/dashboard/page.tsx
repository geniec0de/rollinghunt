import { TodayList } from "@/components/dashboard/today-list";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <h1 className="font-heading text-h1 font-bold text-primary">Upcoming launches</h1>
        <p className="max-w-3xl text-base leading-6 text-slate-700">Track who is shipping next so the community can rally support.</p>
        <div>
          <Button href="/projects/new" variant="cta">Book launch</Button>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="font-heading text-h2 font-bold text-primary">Launch queue</h2>
        <TodayList />
      </div>
    </section>
  );
}
