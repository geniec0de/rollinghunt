"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["in_review", "need_editing", "passed"] as const;

export async function updateLaunchStatus(
  launchId: string,
  payload: { status: string; adminComment: string | null },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can update launch status." };
  }

  const status = ALLOWED_STATUSES.includes(payload.status as (typeof ALLOWED_STATUSES)[number])
    ? payload.status
    : "in_review";

  const { error } = await supabase
    .from("launches")
    .update({ status, admin_comment: payload.adminComment ?? null })
    .eq("id", launchId);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function updateLaunchStatusForm(
  _prevState: { error: string | null } | null,
  formData: FormData,
): Promise<{ error: string | null }> {
  const launchId = formData.get("launchId");
  if (typeof launchId !== "string" || !launchId) {
    return { error: "Missing launch." };
  }
  const status = formData.get("status");
  const adminComment = formData.get("adminComment");
  const result = await updateLaunchStatus(launchId, {
    status: typeof status === "string" ? status : "in_review",
    adminComment: typeof adminComment === "string" ? adminComment : null,
  });
  if (result.error === null) {
    revalidatePath("/admin");
  }
  return result;
}

export async function deleteLaunchAdmin(launchId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can delete launches." };
  }

  const { error } = await supabase.from("launches").delete().eq("id", launchId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin");
  return { error: null };
}

/** Form action for admin page: updates launch and revalidates. */
export async function submitAdminLaunchForm(formData: FormData): Promise<void> {
  const launchId = formData.get("launchId");
  if (typeof launchId !== "string" || !launchId) return;
  const status = formData.get("status");
  const adminComment = formData.get("adminComment");
  await updateLaunchStatus(launchId, {
    status: typeof status === "string" ? status : "in_review",
    adminComment: typeof adminComment === "string" ? adminComment : null,
  });
  revalidatePath("/admin");
}
