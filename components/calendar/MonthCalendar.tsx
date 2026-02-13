"use client";

import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayPanel, type CalendarLaunch } from "@/components/calendar/DayPanel";

type MonthCalendarProps = {
  launches: CalendarLaunch[];
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

export function MonthCalendar({ launches }: MonthCalendarProps) {
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-heading text-3xl font-bold text-primary">{format(month, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-2">
          <Button onClick={() => setMonth((prev) => subMonths(prev, 1))} type="button">
            Previous
          </Button>
          <Button onClick={() => setMonth(startOfMonth(new Date()))} type="button">
            Today
          </Button>
          <Button onClick={() => setMonth((prev) => addMonths(prev, 1))} type="button">
            Next
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="calendar-grid min-w-[50rem]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
            <div className="calendar-weekday px-2 py-1" key={weekday}>
              {weekday}
            </div>
          ))}

          {monthRange.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const launchesForDay = launchesByDay[dayKey] ?? [];
            const isCurrentMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                className={`min-h-36 border border-border bg-paper p-2 text-left transition-colors hover:bg-slate-50 ${isCurrentMonth ? "opacity-100" : "opacity-55"}`}
                key={dayKey}
                onClick={() => setSelectedDate(day)}
                type="button"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isToday ? "text-accent" : "text-primary"}`}>{format(day, "d")}</span>
                  {!!launchesForDay.length && <span className="text-xs text-slate-600">{launchesForDay.length}</span>}
                </div>
                <div className="space-y-2">
                  {launchesForDay.slice(0, 3).map((launch) => (
                    <Card className="p-2" key={launch.id} variant="small">
                      <p className="truncate font-heading text-sm font-bold text-primary">{launch.title}</p>
                      <p className="truncate text-xs text-slate-600">{launch.owner}</p>
                    </Card>
                  ))}
                  {launchesForDay.length > 3 && <p className="text-xs font-semibold text-slate-600">+{launchesForDay.length - 3} more</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && <DayPanel date={selectedDate} launches={dayLaunches} onClose={() => setSelectedDate(null)} />}
    </div>
  );
}
