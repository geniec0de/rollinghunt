import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-center justify-center px-6 py-12">
      <section className="card w-full max-w-lg p-8">
        <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
        <p className="mt-3 text-sm text-slate-600">Sign in to access the rollinghunt schedule.</p>
        <div className="mt-8">
          <SignInForm />
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Need access? <Link className="underline" href="/sign-up">Use an invite code</Link>
        </p>
      </section>
    </main>
  );
}
