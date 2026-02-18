"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileContact } from "@/app/actions/auth";

type ProfileState = { error?: string; success?: string };
const initialState: ProfileState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="cta mt-2" disabled={pending} type="submit">
      {pending ? "Saving…" : "Update contact & social"}
    </button>
  );
}

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

type ProfileContactFormProps = {
  phone: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  timezone: string | null;
};

export function ProfileContactForm({
  phone,
  twitterUrl,
  linkedinUrl,
  githubUrl,
  timezone,
}: ProfileContactFormProps) {
  const [state, formAction] = useActionState(updateProfileContact, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="timezone">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={timezone ?? ""}
          className="input mt-1"
        >
          <option value="">Use browser default</option>
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">Used to show launch times in your local time.</p>
      </div>
      <div>
        <label className="label" htmlFor="phone">
          Phone
        </label>
          <input
            className="input mt-1"
            id="phone"
            name="phone"
            type="text"
            defaultValue={phone ?? ""}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="label" htmlFor="twitterUrl">
            Twitter / X URL
          </label>
          <input
            className="input mt-1"
            id="twitterUrl"
            name="twitterUrl"
            type="url"
            defaultValue={twitterUrl ?? ""}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="label" htmlFor="linkedinUrl">
            LinkedIn URL
          </label>
          <input
            className="input mt-1"
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={linkedinUrl ?? ""}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="label" htmlFor="githubUrl">
            GitHub URL
          </label>
          <input
            className="input mt-1"
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={githubUrl ?? ""}
            placeholder="https://..."
          />
        </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state?.success ? (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
          {state.success}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
