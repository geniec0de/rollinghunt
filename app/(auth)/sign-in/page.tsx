import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ success?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const successMessage = params.success;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-center justify-center px-6 py-12">
      <section className="card w-full max-w-lg p-8">
        <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
        <p className="mt-3 text-sm text-slate-600">Sign in to access the rollinghunt schedule.</p>
        {successMessage ? (
          <p className="mt-4 rounded-none border border-accent/30 bg-red-50/80 px-3 py-2 text-sm font-medium text-accent" role="status">
            {successMessage}
          </p>
        ) : null}
        <div className="mt-8">
          <SignInForm />
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Need access? <Link className="font-medium text-accent underline underline-offset-2 hover:text-red-800" href="/sign-up">Use an invite code</Link>
        </p>
      </section>
    </main>
  );
}
