import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ProfileDisplayNameForm } from "@/components/profile/profile-display-name-form";
import { ProfileContactForm } from "@/components/profile/profile-contact-form";
import { SocialIcons } from "@/components/profile/social-icons";
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
    .select("email, display_name, phone, twitter_url, linkedin_url, github_url, timezone")
    .eq("id", user.id)
    .single();

  const email = profile?.email ?? user.email ?? "—";
  const displayName =
    typeof profile?.display_name === "string" && profile.display_name.trim().length > 0
      ? profile.display_name.trim()
      : null;
  const phone = typeof profile?.phone === "string" && profile.phone.trim().length > 0 ? profile.phone.trim() : null;
  const twitterUrl = typeof profile?.twitter_url === "string" && profile.twitter_url.trim().length > 0 ? profile.twitter_url.trim() : null;
  const linkedinUrl = typeof profile?.linkedin_url === "string" && profile.linkedin_url.trim().length > 0 ? profile.linkedin_url.trim() : null;
  const githubUrl = typeof profile?.github_url === "string" && profile.github_url.trim().length > 0 ? profile.github_url.trim() : null;
  const timezone = typeof profile?.timezone === "string" && profile.timezone.trim().length > 0 ? profile.timezone.trim() : null;

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-h1 font-bold text-primary">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Your info</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs font-medium text-slate-500">Email</dt>
              <dd className="mt-0.5 text-sm text-primary">{email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Display name</dt>
              <dd className="mt-0.5 text-sm text-primary">{displayName ?? "—"}</dd>
              <p className="mt-1 text-xs text-slate-500">Shown as owner on your launches.</p>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Phone</dt>
              <dd className="mt-0.5 text-sm text-primary">{phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Timezone</dt>
              <dd className="mt-0.5 text-sm text-primary">{timezone ? timezone.replace(/_/g, " ") : "—"}</dd>
              <p className="mt-1 text-xs text-slate-500">Launch times shown in this timezone.</p>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Social</dt>
              <dd className="mt-1.5">
                <SocialIcons twitterUrl={twitterUrl} linkedinUrl={linkedinUrl} githubUrl={githubUrl} />
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Edit</h2>
          <div className="mt-4 space-y-6">
            <ProfileDisplayNameForm currentDisplayName={displayName ?? ""} />
            <div className="border-t border-border pt-6">
              <ProfileContactForm
                phone={phone}
                twitterUrl={twitterUrl}
                linkedinUrl={linkedinUrl}
                githubUrl={githubUrl}
                timezone={timezone}
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
