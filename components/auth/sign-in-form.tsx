"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "@/app/actions/auth";

const initialState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="cta mt-2 w-full" disabled={pending} type="submit">
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function SignInForm() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
