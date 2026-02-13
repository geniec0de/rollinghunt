import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectLaunchEditForm, type ProjectWithLaunch } from "@/components/projects/project-launch-edit-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit launch" };

type Props = { params: Promise<{ projectId: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .select("id, name, tagline, product_hunt_url, ask_from_founder, short_explanation, owner_id")
    .eq("id", projectId)
    .single();

  if (projectError || !projectRow) {
    redirect("/my-launches");
  }
  if (projectRow.owner_id !== user.id) {
    redirect("/my-launches");
  }

  const { data: launchRow, error: launchError } = await supabase
    .from("launches")
    .select("launch_date, timezone")
    .eq("project_id", projectId)
    .single();

  if (launchError || !launchRow) {
    redirect("/my-launches");
  }

  const launchDateStr =
    typeof launchRow.launch_date === "string"
      ? launchRow.launch_date
      : launchRow.launch_date instanceof Date
        ? launchRow.launch_date.toISOString().slice(0, 10)
        : String(launchRow.launch_date).slice(0, 10);

  const project: ProjectWithLaunch = {
    id: projectRow.id,
    name: projectRow.name,
    tagline: projectRow.tagline,
    product_hunt_url: projectRow.product_hunt_url,
    ask_from_founder: projectRow.ask_from_founder ?? null,
    short_explanation: projectRow.short_explanation ?? null,
    launch: {
      launch_date: launchDateStr,
      timezone: launchRow.timezone,
    },
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit your launch</h1>
        <p className="mt-2 text-sm text-slate-600">Update project and launch date details.</p>
      </div>
      <div className="card max-w-2xl p-6">
        <ProjectLaunchEditForm project={project} />
      </div>
    </section>
  );
}
