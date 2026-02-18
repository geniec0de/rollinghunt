import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconExternalLink } from "@/components/ui/icon-external-link";
import { formatLaunchTimeInViewerTz } from "@/lib/launch-time";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Member launches" };

type ProjectShape = {
  id: string;
  name: string;
  tagline: string;
  product_hunt_url: string;
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

export default async function AdminMemberLaunchesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role, timezone")
    .eq("id", user.id)
    .single();
  if (adminProfile?.role !== "admin") redirect("/dashboard");

  const { data: memberProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();
  if (!memberProfile) notFound();

  const viewerTimezone = adminProfile?.timezone ?? null;
  const { data: launchesData, error } = await supabase
    .from("launches")
    .select("id, launch_date, timezone, status, admin_comment, projects(id, name, tagline, product_hunt_url)")
    .eq("created_by", userId)
    .order("launch_date", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-700">Unable to load launches: {error.message}</p>;
  }

  const launches = (launchesData as LaunchRow[]) ?? [];
  const displayName =
    typeof memberProfile.display_name === "string" && memberProfile.display_name.trim().length > 0
      ? memberProfile.display_name.trim()
      : "Member";

  return (
    <section className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-accent">
          ← Back to Admin
        </Link>
        <h1 className="mt-2 font-heading text-h1 font-bold text-primary">Launches by {displayName}</h1>
        <p className="mt-1 text-base text-slate-700">All launches (past and upcoming) for this member.</p>
      </div>

      {launches.length === 0 ? (
        <Card className="p-6 text-sm text-slate-700">No launches for this member.</Card>
      ) : (
        <ul className="space-y-4">
          {launches.map((launch) => {
            const project = resolveProject(launch.projects);
            return (
              <li key={launch.id}>
                <Card className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 md:pr-8">
                      <h2 className="truncate font-heading text-xl font-bold leading-tight text-primary">
                        {project?.name ?? "Untitled project"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-700">{project?.tagline ?? "—"}</p>
                      <p className="mt-2 text-xs font-medium text-slate-600">
                        Status:{" "}
                        <span
                          className={
                            launch.status === "passed"
                              ? "text-emerald-700"
                              : launch.status === "need_editing"
                                ? "text-orange-700"
                                : "text-amber-700"
                          }
                        >
                          {launch.status === "passed"
                            ? "Passed"
                            : launch.status === "need_editing"
                              ? "Need editing"
                              : "In review"}
                        </span>
                      </p>
                      {launch.admin_comment ? (
                        <p className="mt-1 text-sm text-amber-800">
                          <span className="font-semibold">Admin:</span> {launch.admin_comment}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 text-left text-sm md:items-end md:text-right">
                      <p className="font-semibold text-primary">
                        {formatLaunchTimeInViewerTz(launch.launch_date, viewerTimezone)}
                      </p>
                      {project?.product_hunt_url ? (
                        <a
                          className="inline-flex items-center justify-center rounded-none border border-accent/30 bg-paper p-2 text-accent transition-all duration-200 hover:border-accent hover:bg-red-50 hover:text-red-800"
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
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
