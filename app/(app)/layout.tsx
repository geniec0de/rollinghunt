import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { LogoIcon } from "@/components/ui/logo-icon";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-content flex-col px-6 py-8">
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <LogoIcon size={28} className="shrink-0" />
            <p className="font-heading text-2xl font-bold tracking-tight text-primary">rollinghunt</p>
          </div>
          <p className="mt-1 text-sm text-slate-600">Rolling Dice Club launch schedule</p>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-primary hover:text-accent transition-colors duration-200">
            Dashboard
          </Link>
          <Link href="/my-launches" className="text-primary hover:text-accent transition-colors duration-200">
            My launches
          </Link>
          <Link href="/projects/new" className="text-primary hover:text-accent transition-colors duration-200">
            Book launch
          </Link>
          <Link href="/profile" className="text-primary hover:text-accent transition-colors duration-200">
            Profile
          </Link>
          <form action={signOut}>
            <button className="cta" type="submit">Sign out</button>
          </form>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
