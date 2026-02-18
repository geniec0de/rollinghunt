"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconExternalLink } from "@/components/ui/icon-external-link";

const LIST_PAGE_SIZE = 6;

export type DashboardLaunch = {
  id: string;
  launchDate: string;
  timezone: string;
  /** Launch time formatted in viewer's timezone (12:01 AM PST on launch date). */
  displayTime?: string;
  status: string;
  adminComment?: string | null;
  createdBy: string;
  title: string;
  tagline: string;
  owner: string;
  productHuntUrl: string;
  askFromFounder?: string | null;
  shortExplanation?: string | null;
};

type TodayListProps = {
  launches: DashboardLaunch[];
  /** Max launches per day (from getDailyLaunchCap). Used by calendar to show "Full" state. */
  dailyCap?: number;
  /** Current day yyyy-MM-dd for highlighting today's launches. */
  today?: string;
  /** Current user id – status shown only to owner and admins, and hidden when passed. */
  currentUserId?: string | null;
  isAdmin?: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  in_review: "In review",
  need_editing: "Need editing",
  passed: "Passed",
};

const STATUS_STYLES: Record<string, string> = {
  in_review: "bg-amber-100 text-amber-800 border-amber-200",
  need_editing: "bg-orange-100 text-orange-800 border-orange-200",
  passed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function TodayList({ launches, dailyCap = 2, today, currentUserId, isAdmin }: TodayListProps) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [listPage, setListPage] = useState(1);

  const totalListPages = Math.max(1, Math.ceil(launches.length / LIST_PAGE_SIZE));
  const paginatedLaunches = useMemo(() => {
    const start = (listPage - 1) * LIST_PAGE_SIZE;
    return launches.slice(start, start + LIST_PAGE_SIZE);
  }, [launches, listPage]);

  const goToCalendar = () => {
    setView("calendar");
  };
  const goToList = () => {
    setView("list");
    setListPage(1);
  };

  if (!launches.length) {
    return <Card className="p-6 text-sm text-slate-700">No launches booked yet.</Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-heading text-h2 font-bold text-primary">Launch queue</h2>
        <div className="inline-flex items-center gap-1 self-start rounded-none border border-border bg-paper p-1 shadow-[3px_3px_0_#000]">
          <Button
            className={view === "list" ? "shadow-[4px_4px_0_#420000]" : "shadow-none"}
            onClick={goToList}
            type="button"
            variant={view === "list" ? "cta" : "default"}
          >
            List
          </Button>
          <Button
            className={view === "calendar" ? "shadow-[4px_4px_0_#420000]" : "shadow-none"}
            onClick={goToCalendar}
            type="button"
            variant={view === "calendar" ? "cta" : "default"}
          >
            Calendar
          </Button>
        </div>
      </div>

      {view === "calendar" ? (
        <MonthCalendar dailyCap={dailyCap} launches={launches} today={today} />
      ) : (
        <>
          <ul className="space-y-4">
            {paginatedLaunches.map((launch) => {
              const isToday = today != null && launch.launchDate === today;
              return (
              <li key={launch.id}>
                <Card
                  className={`p-5 transition-all duration-200 hover:shadow-[4px_4px_0_#000] ${isToday ? "border-l-4 border-l-[var(--color-accent)]" : ""}`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 md:pr-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-heading text-3xl font-bold leading-tight text-primary">{launch.title}</h3>
                        {(currentUserId === launch.createdBy || isAdmin) && launch.status !== "passed" ? (
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[launch.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                            {STATUS_LABELS[launch.status] ?? launch.status}
                          </span>
                        ) : null}
                        {isToday ? (
                          <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">Today</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-base leading-6 text-slate-700">{launch.tagline}</p>
                      {launch.askFromFounder ? (
                        <p className="mt-2 text-sm text-slate-600"><span className="font-semibold">Ask:</span> {launch.askFromFounder}</p>
                      ) : null}
                      {launch.shortExplanation ? (
                        <p className="mt-1 text-sm text-slate-600">{launch.shortExplanation}</p>
                      ) : null}
                      {(currentUserId === launch.createdBy || isAdmin) && launch.adminComment ? (
                        <p className="mt-2 text-sm text-amber-800"><span className="font-semibold">Admin:</span> {launch.adminComment}</p>
                      ) : null}
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Owner: {launch.owner}</p>
                    </div>
                    <div className="shrink-0 text-left text-sm md:text-right">
                      <p className="font-semibold text-primary">{launch.displayTime ?? format(parseISO(launch.launchDate), "MMM d, yyyy")}</p>
                      <a
                        className="mt-3 inline-flex items-center justify-center rounded-none border border-accent/30 bg-paper p-2 text-accent transition-all duration-200 hover:border-accent hover:bg-red-50 hover:text-red-800 hover:shadow-[4px_4px_0_#420000]"
                        href={launch.productHuntUrl}
                        rel="noreferrer"
                        target="_blank"
                        aria-label="Open launch on Product Hunt"
                      >
                        <IconExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                </Card>
              </li>
            );
            })}
          </ul>

          {totalListPages > 1 && (
            <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4" aria-label="List pagination">
              <p className="text-sm font-medium text-slate-600">
                Page {listPage} of {totalListPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="cta-secondary"
                  type="button"
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                  disabled={listPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="cta-secondary"
                  type="button"
                  onClick={() => setListPage((p) => Math.min(totalListPages, p + 1))}
                  disabled={listPage >= totalListPages}
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
