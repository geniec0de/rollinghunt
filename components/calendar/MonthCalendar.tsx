"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayPanel, type CalendarLaunch } from "@/components/calendar/DayPanel";

const MIN_DAYS_IN_ADVANCE = 3;

function isDateBookable(day: Date): boolean {
  const today = new Date();
  const minDate = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), MIN_DAYS_IN_ADVANCE);
  return day >= minDate;
}

type MonthCalendarProps = {
  launches: CalendarLaunch[];
  /** Max launches per day; used to show "Full" and style full days. */
  dailyCap?: number;
};

function buildDayMap(launches: CalendarLaunch[]) {
  return launches.reduce<Record<string, CalendarLaunch[]>>((acc, launch) => {
    if (!acc[launch.launchDate]) {
      acc[launch.launchDate] = [];
    }
    acc[launch.launchDate].push(launch);
    return acc;
  }, {});
}

export function MonthCalendar({ launches, dailyCap = 2 }: MonthCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const launchesByDay = useMemo(() => buildDayMap(launches), [launches]);

  const monthRange = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(monthStart);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    });
  }, [month]);

  const dayLaunches = selectedDate ? launchesByDay[format(selectedDate, "yyyy-MM-dd")] ?? [] : [];

  return (
    <div className="space-y-6">
      <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Calendar month navigation">
        <h3 className="font-heading text-3xl font-bold text-primary">{format(month, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-2">
          <Button variant="cta-secondary" onClick={() => setMonth((prev) => subMonths(prev, 1))} type="button">
            Previous month
          </Button>
          <Button variant="cta-secondary" onClick={() => setMonth(startOfMonth(new Date()))} type="button">
            Today
          </Button>
          <Button variant="cta-secondary" onClick={() => setMonth((prev) => addMonths(prev, 1))} type="button">
            Next month
          </Button>
        </div>
      </nav>

      <div className="overflow-x-auto">
        <div className="calendar-grid min-w-[50rem]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
            <div className="calendar-weekday px-2 py-2" key={weekday}>
              {weekday}
            </div>
          ))}

          {monthRange.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const launchesForDay = launchesByDay[dayKey] ?? [];
            const isCurrentMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, new Date());
            const bookable = isDateBookable(day);
            const full = bookable && launchesForDay.length >= dailyCap;
            const available = bookable && launchesForDay.length < dailyCap;
            const unavailable = !bookable;

            const cellStyles = available
              ? "border-border bg-paper hover:border-slate-300 hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5 focus-within:ring-accent"
              : full
                ? "border-slate-300 bg-slate-100 focus-within:ring-slate-400"
                : "border-slate-200 bg-slate-50 opacity-90 focus-within:ring-slate-300";

            return (
              <div
                className={`flex min-h-36 flex-col border p-2 text-left transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 ${cellStyles} ${isCurrentMonth ? "opacity-100" : "opacity-55"}`}
                key={dayKey}
              >
                <button
                  className="min-h-0 flex-1 cursor-pointer text-left focus:outline-none"
                  onClick={() => setSelectedDate(day)}
                  type="button"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <span className={`text-sm font-semibold ${isToday ? "text-cta-red" : "text-primary"}`}>{format(day, "d")}</span>
                    {full ? (
                      <span className="shrink-0 rounded-none bg-slate-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Full
                      </span>
                    ) : !!launchesForDay.length ? (
                      <span className={`shrink-0 rounded-none px-1.5 py-0.5 text-xs font-semibold ${available ? "bg-accent/10 text-accent" : "bg-slate-300 text-slate-600"}`}>
                        {launchesForDay.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1.5 overflow-hidden">
                    {launchesForDay.slice(0, 3).map((launch) => (
                      <Card className="p-2" key={launch.id} variant="small">
                        <p className="truncate font-heading text-sm font-bold text-primary">{launch.title}</p>
                        <p className="truncate text-xs text-slate-600">{launch.owner}</p>
                      </Card>
                    ))}
                    {launchesForDay.length > 3 && <p className="text-xs font-semibold text-slate-600">+{launchesForDay.length - 3} more</p>}
                  </div>
                </button>
                {available && (
                  <Link
                    className="mt-auto shrink-0 pt-1.5 text-xs font-medium text-accent underline-offset-2 hover:text-red-800 hover:underline"
                    href={`/projects/new?launchDate=${dayKey}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    + Book
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && <DayPanel date={selectedDate} launches={dayLaunches} onClose={() => setSelectedDate(null)} />}
    </div>
  );
}
