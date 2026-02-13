import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

type LaunchRow = {
  id: string;
  launch_date: string;
  timezone: string;
  projects:
    | { name: string; tagline: string; product_hunt_url: string }
    | { name: string; tagline: string; product_hunt_url: string }[]
    | null;
  owner:
    | { display_name: string }
    | { display_name: string }[]
    | null;
};

function resolveProject(projects: LaunchRow["projects"]) {
  if (!projects) return null;
  return Array.isArray(projects) ? projects[0] ?? null : projects;
}
function resolveOwner(owner: LaunchRow["owner"]) {
  if (!owner) return null;
  return Array.isArray(owner) ? owner[0] ?? null : owner;
}

export async function UpcomingLaunches() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("launches")
    .select("id, launch_date, timezone, projects(name, tagline, product_hunt_url), owner:profiles!launches_created_by_fkey(display_name)")
    .gte("launch_date", format(new Date(), "yyyy-MM-dd"))
    .order("launch_date", { ascending: true });

  if (error) {
    return <p className="text-sm text-red-700">Unable to load launches: {error.message}</p>;
  }

  const launches: LaunchRow[] = (data as unknown as LaunchRow[]) ?? [];

  if (!launches.length) {
    return <div className="card p-6 text-sm text-slate-600">No launches booked yet.</div>;
  }

  return (
    <ul className="space-y-4">
      {launches.map((launch) => (
        <li className="card p-5" key={launch.id}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold">{resolveProject(launch.projects)?.name ?? "Untitled project"}</h2>
              <p className="text-sm text-slate-600">{resolveProject(launch.projects)?.tagline ?? "No tagline"}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">by {resolveOwner(launch.owner)?.display_name ?? "Member"}</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold">{launch.launch_date}</p>
              <p className="text-slate-600">Timezone: {launch.timezone}</p>
              <a className="mt-2 inline-block underline" href={resolveProject(launch.projects)?.product_hunt_url ?? "#"} target="_blank" rel="noreferrer">
                Product Hunt link
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
