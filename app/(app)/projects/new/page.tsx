import { ProjectLaunchForm } from "@/components/projects/project-launch-form";
import { isLaunchDateAllowed } from "@/lib/launch-rules";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Book launch" };

type Props = { searchParams: Promise<{ launchDate?: string }> };

export default async function NewProjectPage({ searchParams }: Props) {
  const params = await searchParams;
  const launchDateParam = params.launchDate?.trim();
  const defaultLaunchDate =
    launchDateParam && /^\d{4}-\d{2}-\d{2}$/.test(launchDateParam) && isLaunchDateAllowed(launchDateParam)
      ? launchDateParam
      : undefined;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Book your launch day</h1>
        <p className="mt-2 text-sm text-slate-600">Create your project and reserve one Product Hunt launch date.</p>
      </div>
      <div className="card max-w-2xl p-6">
        <ProjectLaunchForm defaultLaunchDate={defaultLaunchDate} />
      </div>
    </section>
  );
}
