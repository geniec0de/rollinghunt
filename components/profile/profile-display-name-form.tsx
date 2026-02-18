"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileDisplayName } from "@/app/actions/auth";

type ProfileState = { error?: string; success?: string };
const initialState: ProfileState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="cta mt-2" disabled={pending} type="submit">
      {pending ? "Saving…" : "Update display name"}
    </button>
  );
}

type ProfileDisplayNameFormProps = {
  currentDisplayName: string;
};

export function ProfileDisplayNameForm({ currentDisplayName }: ProfileDisplayNameFormProps) {
  const [state, formAction] = useActionState(updateProfileDisplayName, initialState);

  return (
    <form action={formAction} className="mt-6 border-t border-border pt-6">
      <label className="label" htmlFor="displayName">
        Change display name
      </label>
      <input
        className="input mt-1"
        id="displayName"
        name="displayName"
        type="text"
        required
        minLength={2}
        maxLength={80}
        defaultValue={currentDisplayName}
        placeholder="e.g. Jane Doe"
      />
      {state?.error ? <p className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      {state?.success ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
          {state.success}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
