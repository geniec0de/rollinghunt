"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createLaunchForProject } from "@/app/actions/launches";

type ProjectActionState = {
  error?: string;
};

const DEFAULT_TIMEZONE = "Africa/Casablanca";

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(240),
  productHuntUrl: z.string().url().includes("producthunt.com"),
  askFromFounder: z.string().trim().max(500).optional(),
  shortExplanation: z.string().trim().max(1000).optional(),
  launchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim().length ? value : DEFAULT_TIMEZONE),
      z.string().trim().min(2).max(100),
    ),
});

function getDisplayName(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  const metadataName = user.user_metadata?.display_name;
  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim().slice(0, 80);
  }

  const emailPrefix = user.email?.split("@")[0]?.trim();
  if (emailPrefix && emailPrefix.length > 0) {
    return emailPrefix.slice(0, 80);
  }

  return "Member";
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
) {
  const safeEmail = user.email?.trim() || `${user.id}@local.invalid`;

  const { data: existing } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName =
    typeof existing?.display_name === "string" && existing.display_name.trim().length > 0
      ? existing.display_name.trim().slice(0, 80)
      : getDisplayName(user);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: safeEmail,
      display_name: displayName,
    },
    { onConflict: "id" },
  );

  return error ? `Could not load profile: ${error.message}` : null;
}

export async function createProjectWithLaunch(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    productHuntUrl: formData.get("productHuntUrl"),
    askFromFounder: formData.get("askFromFounder"),
    shortExplanation: formData.get("shortExplanation"),
    launchDate: formData.get("launchDate"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { error: "Please fill all fields with valid values." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const profileError = await ensureProfile(supabase, user);
  if (profileError) {
    return { error: profileError };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      tagline: parsed.data.tagline,
      product_hunt_url: parsed.data.productHuntUrl,
      ask_from_founder: parsed.data.askFromFounder?.slice(0, 500) || null,
      short_explanation: parsed.data.shortExplanation?.slice(0, 1000) || null,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return { error: projectError?.message ?? "Could not create project." };
  }

  const launchError = await createLaunchForProject({
    projectId: project.id,
    createdBy: user.id,
    launchDate: parsed.data.launchDate,
    timezone: parsed.data.timezone,
  });

  if (launchError) {
    await supabase.from("projects").delete().eq("id", project.id);
    return { error: launchError };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

const updateProjectSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(240),
  productHuntUrl: z.string().url().includes("producthunt.com"),
  askFromFounder: z.string().trim().max(500).optional(),
  shortExplanation: z.string().trim().max(1000).optional(),
  launchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim().length ? value : DEFAULT_TIMEZONE),
      z.string().trim().min(2).max(100),
    ),
});

export async function updateProjectWithLaunch(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = updateProjectSchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    productHuntUrl: formData.get("productHuntUrl"),
    askFromFounder: formData.get("askFromFounder"),
    shortExplanation: formData.get("shortExplanation"),
    launchDate: formData.get("launchDate"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { error: "Please fill all fields with valid values." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: project, error: projectFetchError } = await supabase
    .from("projects")
    .select("id, owner_id")
    .eq("id", parsed.data.projectId)
    .single();

  if (projectFetchError || !project) {
    return { error: "Project not found." };
  }
  if (project.owner_id !== user.id) {
    return { error: "You can only edit your own projects." };
  }

  const { data: launch, error: launchFetchError } = await supabase
    .from("launches")
    .select("id, launch_date, timezone")
    .eq("project_id", project.id)
    .single();

  if (launchFetchError || !launch) {
    return { error: "Launch not found for this project." };
  }

  const { error: updateProjectError } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      tagline: parsed.data.tagline,
      product_hunt_url: parsed.data.productHuntUrl,
      ask_from_founder: parsed.data.askFromFounder?.slice(0, 500) || null,
      short_explanation: parsed.data.shortExplanation?.slice(0, 1000) || null,
    })
    .eq("id", project.id);

  if (updateProjectError) {
    return { error: updateProjectError.message };
  }

  const currentLaunchDate =
    typeof launch.launch_date === "string"
      ? launch.launch_date
      : launch.launch_date instanceof Date
        ? launch.launch_date.toISOString().slice(0, 10)
        : String(launch.launch_date).slice(0, 10);
  const launchDateChanged = currentLaunchDate !== parsed.data.launchDate;
  const timezoneChanged = launch.timezone !== parsed.data.timezone;
  if (launchDateChanged || timezoneChanged) {
    const { updateLaunch } = await import("@/app/actions/launches");
    const launchError = await updateLaunch(
      launch.id,
      {
        ...(launchDateChanged ? { launchDate: parsed.data.launchDate } : {}),
        ...(timezoneChanged ? { timezone: parsed.data.timezone } : {}),
      },
      user.id,
    );
    if (launchError) {
      return { error: launchError };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/my-launches");
  redirect("/my-launches");
}
