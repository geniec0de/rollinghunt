import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconExternalLink } from "@/components/ui/icon-external-link";
import { formatLaunchTimeInViewerTz } from "@/lib/launch-time";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My launches" };

type ProjectShape = {
  id: string;
  name: string;
  tagline: string;
  product_hunt_url: string;
  ask_from_founder: string | null;
  short_explanation: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  in_review: "In review",
  need_editing: "Need editing",
  passed: "Passed",
};

const STATUS_STYLES: Record<string, string> = {
  in_review: "bg-amber-100 text-amber-800 border-amber-200",
  need_editing: "bg-orange-100 text-orange-800 border-orange-200",
  passed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

type LaunchRow = {
  id: string;
  launch_date: string;
  timezone: string;
  status: string;
  admin_comment: string | null;
  projects: ProjectShape | ProjectShape[] | null;
};

function resolveProject(projects: LaunchRow["projects"]) {
  if (!projects) return null;
  return Array.isArray(projects) ? (projects[0] ?? null) : projects;
}

export default async function MyLaunchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();
  const viewerTimezone = profile?.timezone ?? null;

  const { data, error } = await supabase
    .from("launches")
    .select("id, launch_date, timezone, status, admin_comment, projects(id, name, tagline, product_hunt_url, ask_from_founder, short_explanation)")
    .eq("created_by", user.id)
    .order("launch_date", { ascending: true });

  if (error) {
    return <p className="text-sm text-red-700">Unable to load your launches: {error.message}</p>;
  }

  const launches = (data as LaunchRow[]) ?? [];

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-h1 font-bold text-primary">My launches</h1>
      <p className="max-w-3xl text-base leading-6 text-slate-700">Launches you’ve booked.</p>

      {launches.length === 0 ? (
        <Card className="p-6 text-sm text-slate-700">You haven’t booked any launches yet.</Card>
      ) : (
        <ul className="space-y-4">
          {launches.map((launch) => {
            const project = resolveProject(launch.projects);
            const projectId = project?.id;
            return (
              <li key={launch.id}>
                <Card className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 md:pr-8">
                      <h2 className="truncate font-heading text-xl font-bold leading-tight text-primary">
                        {project?.name ?? "Untitled project"}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{project?.tagline ?? "—"}</p>
                      {project?.ask_from_founder ? (
                        <p className="mt-2 text-xs text-slate-600">
                          <span className="font-semibold">Ask:</span> {project.ask_from_founder}
                        </p>
                      ) : null}
                      {project?.short_explanation ? (
                        <p className="mt-1 text-xs text-slate-600">{project.short_explanation}</p>
                      ) : null}
                      {launch.status !== "passed" ? (
                        <p className="mt-2">
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[launch.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                            {STATUS_LABELS[launch.status] ?? launch.status}
                          </span>
                        </p>
                      ) : null}
                      {launch.admin_comment ? (
                        <p className="mt-1 text-sm text-amber-800">
                          <span className="font-semibold">Admin:</span> {launch.admin_comment}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 text-left text-sm md:items-end md:text-right">
                      <p className="font-semibold text-primary">{formatLaunchTimeInViewerTz(launch.launch_date, viewerTimezone)}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {projectId ? (
                          <Button href={`/projects/${projectId}/edit`} variant="cta-secondary">
                            Edit
                          </Button>
                        ) : null}
                        {project?.product_hunt_url ? (
                          <a
                            className="inline-flex items-center justify-center rounded-none border border-accent/30 bg-paper p-2 text-accent transition-all duration-200 hover:border-accent hover:bg-red-50 hover:text-red-800 hover:shadow-[4px_4px_0_#420000]"
                            href={project.product_hunt_url}
                            rel="noreferrer"
                            target="_blank"
                            aria-label="Open on Product Hunt"
                          >
                            <IconExternalLink size={20} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
