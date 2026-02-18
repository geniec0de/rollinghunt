"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProjectWithLaunch } from "@/app/actions/projects";
import { DatePicker } from "@/components/ui/date-picker";
import { getMinLaunchDateString } from "@/lib/launch-rules";

type ProjectState = { error?: string };
const initialState: ProjectState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="cta mt-2" disabled={pending} type="submit">
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export type ProjectWithLaunch = {
  id: string;
  name: string;
  tagline: string;
  product_hunt_url: string;
  ask_from_founder: string | null;
  short_explanation: string | null;
  launch: {
    launch_date: string;
    timezone: string;
  };
};

type ProjectLaunchEditFormProps = {
  project: ProjectWithLaunch;
};

export function ProjectLaunchEditForm({ project }: ProjectLaunchEditFormProps) {
  const [state, formAction] = useActionState(updateProjectWithLaunch, initialState);
  const minLaunchDate = getMinLaunchDateString();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={project.id} />
      <p className="text-sm text-slate-600">
        Launches can only be booked at least 3 days in advance.
      </p>
      <div>
        <label className="label" htmlFor="edit-name">Project name</label>
        <input
          className="input"
          id="edit-name"
          name="name"
          required
          type="text"
          defaultValue={project.name}
        />
      </div>
      <div>
        <label className="label" htmlFor="edit-tagline">Tagline</label>
        <input
          className="input"
          id="edit-tagline"
          name="tagline"
          required
          type="text"
          defaultValue={project.tagline}
        />
      </div>
      <div>
        <label className="label" htmlFor="edit-productHuntUrl">Product Hunt URL</label>
        <input
          className="input"
          id="edit-productHuntUrl"
          name="productHuntUrl"
          required
          type="url"
          placeholder="https://www.producthunt.com/products/..."
          defaultValue={project.product_hunt_url}
        />
      </div>
      <div>
        <label className="label" htmlFor="edit-askFromFounder">Ask from founder</label>
        <input
          className="input"
          id="edit-askFromFounder"
          name="askFromFounder"
          type="text"
          placeholder="e.g. Feedback on the onboarding flow, or upvotes if you find it useful"
          maxLength={500}
          defaultValue={project.ask_from_founder ?? ""}
        />
        <p className="mt-1 text-xs text-slate-500">One line: what do you want from the community?</p>
      </div>
      <div>
        <label className="label" htmlFor="edit-shortExplanation">Short explanation</label>
        <textarea
          className="input min-h-[80px] resize-y"
          id="edit-shortExplanation"
          name="shortExplanation"
          placeholder="Optional: 1–2 sentences for the launch announcement."
          rows={3}
          maxLength={1000}
          defaultValue={project.short_explanation ?? ""}
        />
      </div>
      <div>
        <DatePicker
          id="edit-launchDate"
          label="Launch date"
          name="launchDate"
          min={minLaunchDate}
          defaultValue={project.launch.launch_date}
        />
      </div>
      <div>
        <label className="label" htmlFor="edit-timezone">Timezone</label>
        <input
          className="input"
          id="edit-timezone"
          name="timezone"
          required
          type="text"
          defaultValue={project.launch.timezone}
        />
      </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
