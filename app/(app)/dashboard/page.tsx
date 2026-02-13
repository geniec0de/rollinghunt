import { format } from "date-fns";
import { TodayList, type DashboardLaunch } from "@/components/dashboard/today-list";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getDailyLaunchCap } from "@/lib/launch-rules";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

type LaunchRow = {
  id: string;
  launch_date: string;
  timezone: string;
  projects:
    | {
      name: string;
      tagline: string;
      product_hunt_url: string;
      ask_from_founder: string | null;
      short_explanation: string | null;
    }
    | Array<{
      name: string;
      tagline: string;
      product_hunt_url: string;
      ask_from_founder: string | null;
      short_explanation: string | null;
    }>
    | null;
  owner:
    | {
      display_name: string;
    }
    | Array<{
      display_name: string;
    }>
    | null;
};

function resolveProject(projects: LaunchRow["projects"]) {
  if (!projects) return null;
  return Array.isArray(projects) ? (projects[0] ?? null) : projects;
}

function resolveOwner(owner: LaunchRow["owner"]) {
  if (!owner) return null;
  return Array.isArray(owner) ? (owner[0] ?? null) : owner;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("launches")
    .select("id, launch_date, timezone, projects(name, tagline, product_hunt_url, ask_from_founder, short_explanation), owner:profiles!launches_created_by_fkey(display_name)")
    .gte("launch_date", format(new Date(), "yyyy-MM-dd"))
    .order("launch_date", { ascending: true });

  if (error) {
    return <p className="text-sm text-red-700">Unable to load launches: {error.message}</p>;
  }

  const launches: DashboardLaunch[] = ((data as LaunchRow[]) ?? []).map((launch) => {
    const project = resolveProject(launch.projects);
    const owner = resolveOwner(launch.owner);
    return {
      id: launch.id,
      launchDate: launch.launch_date,
      timezone: launch.timezone,
      title: project?.name ?? "Untitled project",
      tagline: project?.tagline ?? "No tagline available.",
      owner: owner?.display_name ?? "Member",
      productHuntUrl: project?.product_hunt_url ?? "#",
      askFromFounder: project?.ask_from_founder ?? null,
      shortExplanation: project?.short_explanation ?? null,
    };
  });
  const dailyCap = getDailyLaunchCap();
  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <h1 className="font-heading text-h1 font-bold text-primary">Upcoming launches</h1>
        <p className="max-w-3xl text-base leading-6 text-slate-700">Track who is shipping next so the community can rally support.</p>
        <div>
          <Button href="/projects/new" variant="cta">Book launch</Button>
        </div>
      </div>
      <TodayList dailyCap={dailyCap} launches={launches} />
    </section>
  );
}
