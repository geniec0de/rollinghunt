import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ProfileDisplayNameForm } from "@/components/profile/profile-display-name-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name")
    .eq("id", user.id)
    .single();

  const email = profile?.email ?? user.email ?? "—";
  const displayName =
    typeof profile?.display_name === "string" && profile.display_name.trim().length > 0
      ? profile.display_name.trim()
      : null;

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-h1 font-bold text-primary">Profile</h1>
      <Card className="max-w-md p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</dt>
            <dd className="mt-1 text-base text-primary">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Display name</dt>
            <dd className="mt-1 text-base text-primary">{displayName ?? "—"}</dd>
            <p className="mt-2 text-xs text-slate-500">This is shown as the owner on your launches. You can update it below.</p>
          </div>
        </dl>
        <ProfileDisplayNameForm currentDisplayName={displayName ?? ""} />
      </Card>
    </section>
  );
}
