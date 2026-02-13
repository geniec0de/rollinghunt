import { parseISO, isValid } from "date-fns";

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
