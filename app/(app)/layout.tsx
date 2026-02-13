import Link from "next/link";
import { signOut } from "@/app/actions/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-content flex-col px-6 py-8">
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="font-heading text-2xl font-bold">rollinghunt</p>
          <p className="text-sm text-slate-600">Rolling Dice Club launch schedule</p>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/projects/new">Book launch</Link>
          <form action={signOut}>
            <button className="cta" type="submit">Sign out</button>
          </form>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
