import { addDays, daysBetween, fmtDate, today, weekdayShort } from "../lib/dates";
import { celebrationLabel } from "../lib/events";
import { loadEvents } from "../lib/feedData";

type Input = {
  /** Restrict to one kind. Omit for both. */
  type?: "birthday" | "anniversary";
  /** Look-ahead window in days from today. Default 30. */
  withinDays?: number;
  /** Filter to one person, matched case-insensitively against the name. */
  person?: string;
};

/** Upcoming teammate birthdays and work anniversaries. Use for "whose birthday is next", "any anniversaries this month", "when is X's anniversary". */
export default async function tool(input: Input) {
  const t = today();
  const to = addDays(t, input.withinDays ?? 30);
  const needle = input.person?.trim().toLowerCase();
  const events = await loadEvents();
  const items = events
    .filter((e) => (e.kind === "birthday" || e.kind === "anniversary") && (!input.type || e.kind === input.type))
    .filter((e) => (needle ? (e.person ?? e.title).toLowerCase().includes(needle) : e.start >= t && e.start <= to))
    .map((e) => ({
      person: e.person ?? e.title,
      type: e.kind,
      label: celebrationLabel(e),
      years: e.years ?? null,
      date: e.start,
      dayLabel: `${weekdayShort(e.start)} ${fmtDate(e.start)}`,
      daysAway: daysBetween(t, e.start),
    }));
  return { today: t, window: needle ? null : { from: t, to }, count: items.length, items };
}
