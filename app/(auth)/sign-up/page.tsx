import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-center justify-center px-6 py-12">
      <section className="card w-full max-w-lg p-8">
        <h1 className="font-heading text-3xl font-bold">Create your member account</h1>
        <p className="mt-3 text-sm text-slate-600">Use your invite code to access the launch calendar.</p>
        <div className="mt-8">
          <SignUpForm />
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Already a member? <Link className="underline" href="/sign-in">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
