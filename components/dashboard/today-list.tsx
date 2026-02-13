"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type DashboardLaunch = {
  id: string;
  launchDate: string;
  timezone: string;
  title: string;
  tagline: string;
  owner: string;
  productHuntUrl: string;
};

type TodayListProps = {
  launches: DashboardLaunch[];
};

export function TodayList({ launches }: TodayListProps) {
  const [view, setView] = useState<"list" | "calendar">("list");
  if (!launches.length) {
    return <Card className="p-4 text-sm text-slate-700">No launches booked yet.</Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-heading text-h2 font-bold text-primary">Launch queue</h2>
        <div className="inline-flex items-center gap-2 self-start rounded-none border border-border bg-white p-1">
          <Button
            className={view === "list" ? "shadow-hard" : "shadow-none"}
            onClick={() => setView("list")}
            type="button"
            variant={view === "list" ? "cta" : "default"}
          >
            List
          </Button>
          <Button
            className={view === "calendar" ? "shadow-hard" : "shadow-none"}
            onClick={() => setView("calendar")}
            type="button"
            variant={view === "calendar" ? "cta" : "default"}
          >
            Calendar
          </Button>
        </div>
      </div>

      {view === "calendar" ? (
        <MonthCalendar launches={launches} />
      ) : (
        <ul className="space-y-4">
          {launches.map((launch) => (
            <li key={launch.id}>
              <Card className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 md:pr-8">
                    <h3 className="truncate font-heading text-3xl font-bold leading-tight text-primary">{launch.title}</h3>
                    <p className="mt-2 text-base leading-6 text-slate-700">{launch.tagline}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Owner: {launch.owner}</p>
                  </div>
                  <div className="shrink-0 text-left text-sm md:text-right">
                    <p className="font-semibold text-primary">{format(parseISO(launch.launchDate), "MMM d, yyyy")}</p>
                    <p className="text-slate-700">{launch.timezone}</p>
                    <a className="mt-3 inline-block text-sm font-semibold underline underline-offset-2" href={launch.productHuntUrl} rel="noreferrer" target="_blank">
                      Product Hunt link
                    </a>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
