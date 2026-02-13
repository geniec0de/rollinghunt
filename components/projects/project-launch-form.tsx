"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProjectWithLaunch } from "@/app/actions/projects";
import { DatePicker } from "@/components/ui/date-picker";

const initialState = {};
const DEFAULT_TIMEZONE = "Africa/Casablanca";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="cta mt-2" disabled={pending} type="submit">
      {pending ? "Booking..." : "Create project and book"}
    </button>
  );
}

export function ProjectLaunchForm() {
  const [state, formAction] = useActionState(createProjectWithLaunch, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
        <DatePicker id="launchDate" label="Launch date" name="launchDate" />
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
