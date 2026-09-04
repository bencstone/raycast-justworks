import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { JwEvent, classify, dedupeHolidays, mergeAdjacentPto, sortByStart } from "./events";
import { parseIcs } from "./ics";

export interface Preferences {
  feedUrl: string;
  companyUrl?: string;
}

export function getPrefs(): Preferences {
  const p = getPreferenceValues<Preferences>();
  return {
    feedUrl: (p.feedUrl ?? "").trim(),
    companyUrl: p.companyUrl?.trim() || "https://payroll.justworks.com/calendar",
  };
}

export class FeedError extends Error {
  constructor(
    message: string,
    public readonly hint?: string,
  ) {
    super(message);
  }
}

export async function fetchFeed(url: string): Promise<JwEvent[]> {
  if (!url)
    throw new FeedError(
      "No iCal link configured",
      "Add your Justworks subscription link in the extension preferences.",
    );
  let parsed: URL;
  try {
    parsed = new URL(url.replace(/^webcal:/, "https:"));
  } catch {
    throw new FeedError(
      "That doesn't look like a URL",
      "Paste the full link Justworks gives you under Calendar → Filters → Your subscription.",
    );
  }
  const res = await fetch(parsed.toString(), { headers: { Accept: "text/calendar" } });
  if (!res.ok) {
    throw new FeedError(
      `Justworks returned ${res.status}`,
      res.status === 401 || res.status === 403 || res.status === 404
        ? "The subscription link may have been revoked. Create a new one in Justworks and update the preference."
        : "Try again in a moment.",
    );
  }
  const text = await res.text();
  if (!/BEGIN:VCALENDAR/.test(text))
    throw new FeedError("Response wasn't a calendar", "Check the link points at the Justworks .ics feed.");
  return sortByStart(dedupeHolidays(mergeAdjacentPto(parseIcs(text).map(classify))));
}

export function useFeed() {
  const { feedUrl } = getPrefs();
  return useCachedPromise(fetchFeed, [feedUrl], { keepPreviousData: true });
}
