"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getDailyLaunchCap,
  isLaunchDateAllowed,
  isValidIanaTimeZone,
  normalizeDateValue,
} from "@/lib/launch-rules";

type LaunchInput = {
  projectId: string;
  createdBy: string;
  launchDate: string;
  timezone: string;
};

export async function createLaunchForProject(input: LaunchInput): Promise<string | null> {
  if (!isValidIanaTimeZone(input.timezone)) {
    return "Timezone is invalid.";
  }

  const normalizedDate = normalizeDateValue(input.launchDate);
  if (!normalizedDate) {
    return "Launch date is invalid.";
  }

  if (!isLaunchDateAllowed(normalizedDate)) {
    return "Launches can only be booked at least 3 days in advance.";
  }

  const supabase = await createClient();
  const dailyCap = getDailyLaunchCap();

  const { count, error: countError } = await supabase
    .from("launches")
    .select("id", { count: "exact", head: true })
    .eq("launch_date", normalizedDate);

  if (countError) {
    return countError.message;
  }

  if ((count ?? 0) >= dailyCap) {
    return `This date is full. Limit is ${dailyCap} launches per day.`;
  }

  const { error } = await supabase.from("launches").insert({
    project_id: input.projectId,
    launch_date: normalizedDate,
    timezone: input.timezone,
    created_by: input.createdBy,
  });

  if (error) {
    if (error.code === "23505") {
      return "This project already has a launch date.";
    }
    return error.message;
  }

  return null;
}

/** Update launch date/timezone; validates date and daily cap (excluding this launch when moving). */
export async function updateLaunch(
  launchId: string,
  updates: { launchDate?: string; timezone?: string },
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data: launch, error: fetchError } = await supabase
    .from("launches")
    .select("id, launch_date, timezone, created_by")
    .eq("id", launchId)
    .single();

  if (fetchError || !launch) {
    return "Launch not found.";
  }
  if (launch.created_by !== userId) {
    return "You can only edit your own launches.";
  }

  const newDate = updates.launchDate ? normalizeDateValue(updates.launchDate) : null;
  const newTimezone = updates.timezone?.trim();

  if (updates.timezone !== undefined && newTimezone && !isValidIanaTimeZone(newTimezone)) {
    return "Timezone is invalid.";
  }
  if (newDate && !isLaunchDateAllowed(newDate)) {
    return "Launches can only be booked at least 3 days in advance.";
  }

  if (newDate) {
    const dailyCap = getDailyLaunchCap();
    const { count, error: countError } = await supabase
      .from("launches")
      .select("id", { count: "exact", head: true })
      .eq("launch_date", newDate)
      .neq("id", launchId);

    if (countError) return countError.message;
    if ((count ?? 0) >= dailyCap) {
      return `That date is full. Limit is ${dailyCap} launches per day.`;
    }
  }

  const payload: { launch_date?: string; timezone?: string } = {};
  if (newDate) payload.launch_date = newDate;
  if (newTimezone) payload.timezone = newTimezone;
  if (Object.keys(payload).length === 0) return null;

  const { error } = await supabase.from("launches").update(payload).eq("id", launchId);

  if (error) return error.message;
  return null;
}
