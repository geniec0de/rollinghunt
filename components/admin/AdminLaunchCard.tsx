"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateLaunchStatusForm, deleteLaunchAdmin } from "@/app/actions/admin";
import { formatLaunchTimeInViewerTz } from "@/lib/launch-time";

type AdminLaunchCardProps = {
  launch: {
    id: string;
    launch_date: string;
    status: string;
    admin_comment: string | null;
    created_by: string;
    projectName: string;
    ownerDisplayName: string;
  };
  viewerTimezone: string | null;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta-secondary" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

export function AdminLaunchCard({ launch, viewerTimezone }: AdminLaunchCardProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateLaunchStatusForm, null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteState, setDeleteState] = useState<{ error: string | null; pending: boolean }>({
    error: null,
    pending: false,
  });

  async function handleDelete() {
    if (!confirm("Delete this launch? This cannot be undone.")) return;
    setDeleteState({ error: null, pending: true });
    const result = await deleteLaunchAdmin(launch.id);
    setDeleteState({ error: result.error, pending: false });
    if (result.error === null) {
      router.refresh();
    }
  }

  useEffect(() => {
    if (state && state.error === null) {
      setShowSuccess(true);
      router.refresh();
      const t = setTimeout(() => setShowSuccess(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <Card className="relative overflow-hidden p-5">
      {showSuccess && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 transition-opacity duration-200">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
          Saved
        </div>
      )}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="launchId" value={launch.id} />
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="font-heading text-lg font-bold text-primary">
              {launch.projectName}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {formatLaunchTimeInViewerTz(launch.launch_date, viewerTimezone)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Owner:{" "}
              <Link
                href={`/admin/members/${launch.created_by}`}
                className="font-medium text-accent hover:underline"
              >
                {launch.ownerDisplayName}
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <label
              htmlFor={`status-${launch.id}`}
              className="text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              Status
            </label>
            <select
              id={`status-${launch.id}`}
              name="status"
              defaultValue={launch.status ?? "in_review"}
              className="rounded-none border border-border bg-paper px-3 py-2 text-sm transition-colors"
            >
              <option value="in_review">In review</option>
              <option value="need_editing">Need editing</option>
              <option value="passed">Passed</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor={`adminComment-${launch.id}`}
            className="text-xs font-semibold uppercase tracking-wide text-slate-600"
          >
            Admin comment
          </label>
          <textarea
            id={`adminComment-${launch.id}`}
            name="adminComment"
            defaultValue={launch.admin_comment ?? ""}
            rows={2}
            className="mt-1 w-full rounded-none border border-border bg-paper px-3 py-2 text-sm transition-colors placeholder:text-slate-400"
            placeholder="Optional note for the launch owner"
          />
        </div>
        {state?.error ? (
          <p className="text-sm text-red-700">{state.error}</p>
        ) : null}
        {deleteState.error ? (
          <p className="text-sm text-red-700">{deleteState.error}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <SaveButton />
          <Button
            type="button"
            variant="default"
            className="border-red-200 bg-paper text-red-700 hover:bg-red-50 hover:border-red-300"
            disabled={deleteState.pending}
            onClick={handleDelete}
          >
            {deleteState.pending ? "Deleting…" : "Delete launch"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
