import { daysBetween, fmtDate, today, weekdayLong } from "../lib/dates";
import { loadEvents } from "../lib/feedData";

type Input = {
  /** Only holidays from today forward. Default true. Set false to include past holidays in the feed. */
  upcomingOnly?: boolean;
};

/** Company holidays with the next one first and a countdown in days. Use for "when is the next holiday", "is Monday a holiday", "list this year's holidays". */
export default async function tool(input: Input) {
  const t = today();
  const events = await loadEvents();
  const holidays = events
    .filter((e) => e.kind === "holiday")
    .filter((e) => ((input.upcomingOnly ?? true) ? e.end >= t : true))
    .map((e) => ({
      name: e.title,
      date: e.start,
      dayLabel: `${weekdayLong(e.start)}, ${fmtDate(e.start)}`,
      daysAway: daysBetween(t, e.start),
    }));
  return { today: t, next: holidays.find((h) => h.daysAway >= 0) ?? null, holidays };
}
