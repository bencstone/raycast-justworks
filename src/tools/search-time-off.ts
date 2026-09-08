import { addDays, today } from "../lib/dates";
import { backOn } from "../lib/events";
import { loadEvents } from "../lib/feedData";

type Input = {
  /** Filter to one person, matched case-insensitively against the name (first name is enough). Omit for everyone. */
  person?: string;
  /** Start of the window, YYYY-MM-DD. Defaults to today. */
  from?: string;
  /** End of the window, YYYY-MM-DD. Defaults to 60 days after `from`. */
  to?: string;
  /** Include time off that already ended before `from`. Default false. */
  includePast?: boolean;
};

/** Upcoming (or past) approved time off, optionally for one person or within a date window. Use for "when is X out next", "who's out next week", "is anyone off in October". */
export default async function tool(input: Input) {
  const from = input.from?.trim() || today();
  const to = input.to?.trim() || addDays(from, 60);
  const needle = input.person?.trim().toLowerCase();
  const events = await loadEvents();
  const items = events
    .filter((e) => e.kind === "pto")
    .filter((e) => (input.includePast ? e.start <= to : e.end >= from && e.start <= to))
    .filter((e) => !needle || (e.person ?? e.title).toLowerCase().includes(needle))
    .map((e) => ({ person: e.person ?? e.title, from: e.start, to: e.end, backOn: backOn(e) }));
  return { window: { from, to }, person: input.person ?? null, count: items.length, items };
}
