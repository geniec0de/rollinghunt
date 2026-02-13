import { addDays, format, parseISO, isValid, startOfDay } from "date-fns";

/** Launches can only be booked at least this many days in advance. */
export const MIN_DAYS_IN_ADVANCE = 3;

export function getDailyLaunchCap() {
  const rawValue = Number(process.env.LAUNCHES_PER_DAY ?? "2");
  if (Number.isNaN(rawValue)) {
    return 2;
  }

  return Math.min(2, Math.max(1, Math.trunc(rawValue)));
}

export function isValidIanaTimeZone(timezone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function normalizeDateValue(input: string) {
  const parsed = parseISO(input);
  if (!isValid(parsed)) {
    return null;
  }

  return input;
}

/** Returns the earliest allowed launch date (today + MIN_DAYS_IN_ADVANCE) as YYYY-MM-DD. */
export function getMinLaunchDateString(): string {
  return format(addDays(startOfDay(new Date()), MIN_DAYS_IN_ADVANCE), "yyyy-MM-dd");
}

/** True if the given YYYY-MM-DD date is at least MIN_DAYS_IN_ADVANCE in the future. */
export function isLaunchDateAllowed(dateString: string): boolean {
  const min = getMinLaunchDateString();
  return dateString >= min;
}
