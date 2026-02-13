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
  const displayName = getDisplayName(user);
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
