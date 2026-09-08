import { fmtDate, today, weekdayLong } from "../lib/dates";
import { backOn, isActiveOn } from "../lib/events";
import { loadEvents } from "../lib/feedData";

type Input = {
  /** The date to check, as YYYY-MM-DD. Defaults to today. Use for questions like "who's out tomorrow" or "who's off on Friday". */
  date?: string;
};

/** Who is on approved time off on a given day (default today), with the day each person is back. */
export default async function tool(input: Input) {
  const date = input.date?.trim() || today();
  const events = await loadEvents();
  const out = events
    .filter((e) => e.kind === "pto" && isActiveOn(e, date))
    .map((e) => ({
      person: e.person ?? e.title,
      from: e.start,
      to: e.end,
      backOn: backOn(e),
      backOnLabel: `${weekdayLong(backOn(e))}, ${fmtDate(backOn(e))}`,
    }));
  return {
    date,
    dayLabel: `${weekdayLong(date)}, ${fmtDate(date)}`,
    count: out.length,
    out,
    note: "Partial days appear as full days: Justworks records partial PTO as hours per day and the feed carries dates only.",
  };
}
