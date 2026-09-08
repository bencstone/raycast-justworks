import { daysBetween, fmtDate, today, weekdayLong } from "../lib/dates";
import { loadEvents } from "../lib/feedData";

type Input = {
  /** How many upcoming pay dates to return. Default 6. */
  limit?: number;
};

/** The user's upcoming paydays (and any off-cycle payment runs) with a countdown to the next one. */
export default async function tool(input: Input) {
  const t = today();
  const events = await loadEvents();
  const upcoming = events
    .filter((e) => (e.kind === "payday" || e.kind === "offcycle") && e.start >= t)
    .slice(0, input.limit ?? 6)
    .map((e) => ({
      date: e.start,
      dayLabel: `${weekdayLong(e.start)}, ${fmtDate(e.start)}`,
      daysAway: daysBetween(t, e.start),
      type: e.kind === "offcycle" ? "off-cycle payment" : "regular payday",
    }));
  return { today: t, next: upcoming.find((p) => p.type === "regular payday") ?? null, upcoming };
}
