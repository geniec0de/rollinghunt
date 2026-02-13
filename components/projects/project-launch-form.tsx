"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProjectWithLaunch } from "@/app/actions/projects";
import { DatePicker } from "@/components/ui/date-picker";
import { getMinLaunchDateString } from "@/lib/launch-rules";

type ProjectState = { error?: string };
const initialState: ProjectState = {};
const DEFAULT_TIMEZONE = "Africa/Casablanca";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="cta mt-2" disabled={pending} type="submit">
      {pending ? "Booking..." : "Create project and book"}
    </button>
  );
}

type ProjectLaunchFormProps = {
  /** Pre-filled launch date (YYYY-MM-DD) when coming from calendar click. */
  defaultLaunchDate?: string;
};

export function ProjectLaunchForm({ defaultLaunchDate }: ProjectLaunchFormProps) {
  const [state, formAction] = useActionState(createProjectWithLaunch, initialState);
  const minLaunchDate = getMinLaunchDateString();

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-slate-600">
        Launches can only be booked at least 3 days in advance.
      </p>
      <div>
        <label className="label" htmlFor="name">Project name</label>
        <input className="input" id="name" name="name" required type="text" />
      </div>
      <div>
        <label className="label" htmlFor="tagline">Tagline</label>
        <input className="input" id="tagline" name="tagline" required type="text" />
      </div>
      <div>
        <label className="label" htmlFor="productHuntUrl">Product Hunt URL</label>
        <input className="input" id="productHuntUrl" name="productHuntUrl" required type="url" placeholder="https://www.producthunt.com/products/..." />
      </div>
      <div>
        <label className="label" htmlFor="askFromFounder">Ask from founder</label>
        <input
          className="input"
          id="askFromFounder"
          name="askFromFounder"
          type="text"
          placeholder="e.g. Feedback on the onboarding flow, or upvotes if you find it useful"
          maxLength={500}
        />
        <p className="mt-1 text-xs text-slate-500">One line: what do you want from the community?</p>
      </div>
      <div>
        <label className="label" htmlFor="shortExplanation">Short explanation</label>
        <textarea
          className="input min-h-[80px] resize-y"
          id="shortExplanation"
          name="shortExplanation"
          placeholder="Optional: 1–2 sentences for the launch announcement."
          rows={3}
          maxLength={1000}
        />
      </div>
      <div>
        <DatePicker
          id="launchDate"
          label="Launch date"
          name="launchDate"
          min={minLaunchDate}
          defaultValue={defaultLaunchDate}
        />
      </div>
      <div>
        <label className="label" htmlFor="timezone">Timezone</label>
        <input className="input" id="timezone" name="timezone" required type="text" defaultValue={DEFAULT_TIMEZONE} />
      </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
