/**
 * Product Hunt launches are at 12:01 AM Pacific (America/Los_Angeles) on the launch date.
 * This module formats that moment in the viewer's timezone using date-fns-tz.
 */

import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

const PH_LAUNCH_TZ = "America/Los_Angeles";
const DISPLAY_FORMAT = "MMM d, yyyy h:mm a";

/**
 * Format the Product Hunt launch time (12:01 AM Pacific on launchDate) in the viewer's timezone.
 * @param launchDate - yyyy-mm-dd
 * @param viewerTimezone - IANA timezone (e.g. America/New_York). Falls back to UTC if invalid.
 */
export function formatLaunchTimeInViewerTz(
  launchDate: string,
  viewerTimezone: string | null | undefined
): string {
  const [y, m, d] = launchDate.split("-").map(Number);
  if (!y || !m || !d) {
    return launchDate;
  }

  // 00:01 on launch_date in America/Los_Angeles (date components as local in that zone)
  const localInLA = new Date(y, m - 1, d, 0, 1, 0);
  const utc = fromZonedTime(localInLA, PH_LAUNCH_TZ);

  const tz = viewerTimezone && isValidTz(viewerTimezone) ? viewerTimezone : "UTC";
  try {
    return formatInTimeZone(utc, tz, DISPLAY_FORMAT);
  } catch {
    return formatInTimeZone(utc, "UTC", DISPLAY_FORMAT);
  }
}

function isValidTz(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
