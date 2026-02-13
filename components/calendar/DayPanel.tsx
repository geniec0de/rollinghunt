"use client";

import { addDays, format } from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconExternalLink } from "@/components/ui/icon-external-link";

const MIN_DAYS_IN_ADVANCE = 3;

function isDateBookable(date: Date): boolean {
  const today = new Date();
  const minDate = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), MIN_DAYS_IN_ADVANCE);
  return date >= minDate;
}

export type CalendarLaunch = {
  id: string;
  launchDate: string;
  timezone: string;
  title: string;
  tagline: string;
  owner: string;
  productHuntUrl: string;
};

type DayPanelProps = {
  date: Date;
  launches: CalendarLaunch[];
  onClose: () => void;
};

export function DayPanel({ date, launches, onClose }: DayPanelProps) {
  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-paper p-5 shadow-hard md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Day details</p>
          <h3 className="mt-1 font-heading text-2xl font-bold text-primary">{format(date, "EEEE, MMM d")}</h3>
        </div>
        <Button variant="cta-secondary" className="h-8 px-3" onClick={onClose} type="button">
          Close
        </Button>
      </div>

      {isDateBookable(date) && (
        <div className="mb-4">
          <Link
            className="cta inline-block w-full py-2 text-center text-sm"
            href={`/projects/new?launchDate=${format(date, "yyyy-MM-dd")}`}
          >
            Book launch on this day
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {launches.length ? (
          launches.map((launch) => (
            <Card className="p-4" key={launch.id}>
              <h4 className="font-heading text-xl font-bold text-primary">{launch.title}</h4>
              <p className="mt-1 text-sm text-slate-700">{launch.tagline}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Owner: {launch.owner}</p>
              <p className="mt-1 text-xs text-slate-600">{launch.timezone}</p>
              <a
                className="mt-3 inline-flex items-center justify-center rounded-none border border-accent/30 bg-paper p-2 text-accent transition-all duration-200 hover:border-accent hover:bg-red-50 hover:text-red-800 hover:shadow-[4px_4px_0_#420000]"
                href={launch.productHuntUrl}
                rel="noreferrer"
                target="_blank"
                aria-label="Open launch on Product Hunt"
              >
                <IconExternalLink size={20} />
              </a>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-sm text-slate-700">No launches booked for this day.</Card>
        )}
      </div>
    </aside>
  );
}
