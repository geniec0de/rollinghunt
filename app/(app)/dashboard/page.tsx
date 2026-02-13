import { TodayList } from "@/components/dashboard/today-list";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-heading text-h1 font-bold text-primary">Upcoming launches</h1>
        <p className="mt-2 max-w-3xl text-slate-700">Track who is shipping next so the community can rally support.</p>
        <div className="mt-5">
          <Button href="/projects/new" variant="cta">Book launch</Button>
        </div>
      </div>
      <TodayList />
    </section>
  );
}
