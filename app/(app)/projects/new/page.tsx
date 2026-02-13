import { ProjectLaunchForm } from "@/components/projects/project-launch-form";

export default function NewProjectPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Book your launch day</h1>
        <p className="mt-2 text-sm text-slate-600">Create your project and reserve one Product Hunt launch date.</p>
      </div>
      <div className="card max-w-2xl p-6">
        <ProjectLaunchForm />
      </div>
    </section>
  );
}
