"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpWithInvite } from "@/app/actions/auth";

const initialState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="cta mt-2 w-full" disabled={pending} type="submit">
      {pending ? "Creating account..." : "Create account"}
    </button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpWithInvite, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="displayName">Display name</label>
        <input className="input" id="displayName" name="displayName" required type="text" />
      </div>
      <div>
        <label className="label" htmlFor="inviteCode">Invite code</label>
        <input className="input" id="inviteCode" name="inviteCode" required type="text" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" required type="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" required type="password" minLength={8} />
      </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
