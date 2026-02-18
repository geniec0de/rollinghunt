"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerActionClient } from "@/lib/supabase/server";

type AuthActionState = {
  error?: string;
  success?: string;
};

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().trim().min(2).max(80),
  inviteCode: z.string().trim().min(3).max(64),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function normalizeInviteCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function signUpWithInvite(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    inviteCode: formData.get("inviteCode"),
  });

  if (!parsed.success) {
    return { error: "Please provide valid sign-up details." };
  }

  const supabase = await createServerActionClient();
  const { email, password, displayName, inviteCode } = parsed.data;
  const normalizedInviteCode = normalizeInviteCode(inviteCode);

  const inviteValidationRes = await supabase.rpc("is_invite_code_valid", {
    p_invite_code: normalizedInviteCode,
  });

  if (inviteValidationRes.error) {
    return { error: `Invite validation failed: ${inviteValidationRes.error.message}` };
  }

  if (inviteValidationRes.data !== true) {
    return { error: "Invite code is invalid, expired, or out of uses." };
  }

  const signUpRes = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpRes.error || !signUpRes.data.user) {
    if (signUpRes.error?.message?.toLowerCase().includes("already registered")) {
      return { error: "This email is already registered. Please sign in instead." };
    }
    return { error: signUpRes.error?.message ?? "Unable to create account." };
  }

  const userId = signUpRes.data.user.id;

  const inviteRes = await supabase.rpc("register_with_invite", {
    p_user_id: userId,
    p_email: email,
    p_display_name: displayName,
    p_invite_code: normalizedInviteCode,
  });

  if (inviteRes.error) {
    await supabase.auth.signOut();
    return { error: `Invite registration failed: ${inviteRes.error.message}` };
  }

  if (inviteRes.data !== true) {
    await supabase.auth.signOut();
    return { error: "Invite code is invalid, expired, or out of uses." };
  }

  revalidatePath("/sign-in");
  redirect("/sign-in?success=Account created. Please sign in.");
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please provide a valid email and password." };
  }

  const supabase = await createServerActionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createServerActionClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

const updateDisplayNameSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
});

export async function updateProfileDisplayName(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updateDisplayNameSchema.safeParse({
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: "Display name must be 2–80 characters." };
  }

  const supabase = await createServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/my-launches");
  return { success: "Display name updated. It will show as the owner name on your launches." };
}

export async function updateProfileContact(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const phone = formData.get("phone");
  const twitterUrl = formData.get("twitterUrl");
  const linkedinUrl = formData.get("linkedinUrl");
  const githubUrl = formData.get("githubUrl");
  const timezone = formData.get("timezone");

  const { error } = await supabase
    .from("profiles")
    .update({
      phone: typeof phone === "string" ? phone.trim() || null : null,
      twitter_url: typeof twitterUrl === "string" ? twitterUrl.trim() || null : null,
      linkedin_url: typeof linkedinUrl === "string" ? linkedinUrl.trim() || null : null,
      github_url: typeof githubUrl === "string" ? githubUrl.trim() || null : null,
      timezone: typeof timezone === "string" ? timezone.trim() || null : null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Contact and social links updated." };
}
