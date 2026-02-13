import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

type LaunchRow = {
  id: string;
  launch_date: string;
  timezone: string;
  projects: Array<{
    name: string;
    tagline: string;
    product_hunt_url: string;
  }> | null;
};

export async function TodayList() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("launches")
    .select("id, launch_date, timezone, projects(name, tagline, product_hunt_url)")
    .gte("launch_date", format(new Date(), "yyyy-MM-dd"))
    .order("launch_date", { ascending: true });

  if (error) {
    return <p className="text-sm text-red-700">Unable to load launches: {error.message}</p>;
  }

  const launches = (data as LaunchRow[]) ?? [];

  if (!launches.length) {
    return <Card className="p-4 text-sm text-slate-700">No launches booked yet.</Card>;
  }

  return (
    <ul className="space-y-3">
      {launches.map((launch) => (
        <li key={launch.id}>
          <Card className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h3 className="truncate font-heading text-xl font-bold text-primary">{launch.projects?.[0]?.name ?? "Untitled project"}</h3>
                <p className="mt-1 text-sm text-slate-700">{launch.projects?.[0]?.tagline ?? "No tagline available."}</p>
              </div>
              <div className="shrink-0 text-left text-sm md:text-right">
                <p className="font-semibold text-primary">{launch.launch_date}</p>
                <p className="text-slate-700">{launch.timezone}</p>
                <a
                  className="mt-2 inline-block text-sm font-semibold underline underline-offset-2"
                  href={launch.projects?.[0]?.product_hunt_url ?? "#"}
                  rel="noreferrer"
                  target="_blank"
                >
                  Product Hunt link
                </a>
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
