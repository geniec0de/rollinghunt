"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getDailyLaunchCap,
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
