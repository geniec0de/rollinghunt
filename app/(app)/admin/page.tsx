import { format } from "date-fns";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AdminLaunchCard } from "@/components/admin/AdminLaunchCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin" };

type LaunchRow = {
  id: string;
  launch_date: string;
  timezone: string;
  status: string;
  admin_comment: string | null;
  created_by: string;
  projects:
    | { name: string }
    | Array<{ name: string }>
    | null;
  owner:
    | { display_name: string }
    | Array<{ display_name: string }>
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

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, timezone")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const viewerTimezone = profile?.timezone ?? null;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("launches")
    .select("id, launch_date, timezone, status, admin_comment, created_by, projects(name), owner:profiles!launches_created_by_fkey(display_name)")
    .gte("launch_date", todayStr)
    .order("launch_date", { ascending: true });

  if (error) {
    return <p className="text-sm text-red-700">Unable to load launches: {error.message}</p>;
  }

  const launches = (data as LaunchRow[]) ?? [];

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-h1 font-bold text-primary">Admin — Review launches</h1>
      <p className="max-w-3xl text-base leading-6 text-slate-700">Set status and add comments for each launch.</p>

      {launches.length === 0 ? (
        <Card className="p-6 text-sm text-slate-700">No upcoming launches.</Card>
      ) : (
        <ul className="space-y-4">
          {launches.map((launch) => {
            const project = resolveProject(launch.projects);
            const owner = resolveOwner(launch.owner);
            return (
              <li
                key={`${launch.id}-${launch.status ?? ""}-${launch.admin_comment ?? ""}`}
              >
                <AdminLaunchCard
                  launch={{
                    id: launch.id,
                    launch_date: launch.launch_date,
                    status: launch.status ?? "in_review",
                    admin_comment: launch.admin_comment,
                    created_by: launch.created_by,
                    projectName: project?.name ?? "Untitled project",
                    ownerDisplayName: owner?.display_name ?? "—",
                  }}
                  viewerTimezone={viewerTimezone}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
