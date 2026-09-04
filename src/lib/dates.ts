/** All Justworks feed events are all-day; we work in local ISO date strings (YYYY-MM-DD). */

export type ISODate = string;

const MS_DAY = 86_400_000;

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function today(): ISODate {
  return toISO(new Date());
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((fromISO(to).getTime() - fromISO(from).getTime()) / MS_DAY);
}

export function isWeekend(iso: ISODate): boolean {
  const dow = fromISO(iso).getDay();
  return dow === 0 || dow === 6;
}

/** Next weekday on or after `iso`. */
export function nextWorkday(iso: ISODate): ISODate {
  let d = iso;
  while (isWeekend(d)) d = addDays(d, 1);
  return d;
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: ISODate): ISODate {
  const d = fromISO(iso);
  const dow = d.getDay(); // 0 = Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(iso, diff);
}

export function endOfWeek(iso: ISODate): ISODate {
  return addDays(startOfWeek(iso), 6);
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function weekdayShort(iso: ISODate): string {
  return WEEKDAY_SHORT[fromISO(iso).getDay()];
}

export function weekdayLong(iso: ISODate): string {
  return WEEKDAY_LONG[fromISO(iso).getDay()];
}

/** "Sep 8" — adds the year only when it differs from the current year. */
export function fmtDate(iso: ISODate, opts: { weekday?: boolean } = {}): string {
  const d = fromISO(iso);
  const base = `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
  const withYear = d.getFullYear() === new Date().getFullYear() ? base : `${base}, ${d.getFullYear()}`;
  return opts.weekday ? `${WEEKDAY_SHORT[d.getDay()]}, ${withYear}` : withYear;
}

/** "Sep 8", "Sep 8 – 10", "Sep 28 – Oct 2" (inclusive end). */
export function fmtRange(start: ISODate, end: ISODate): string {
  if (start === end) return fmtDate(start);
  const s = fromISO(start);
  const e = fromISO(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}`;
  }
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

/** Relative label for a future/past date: "Today", "Tomorrow", "Thu", "in 12 days", "3 days ago". */
export function fmtRelative(iso: ISODate, from: ISODate = today()): string {
  const n = daysBetween(from, iso);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n > 1 && n < 7) return weekdayLong(iso);
  if (n > 0) return `in ${n} days`;
  return `${-n} days ago`;
}

/** Inclusive day count of a range. */
export function rangeLength(start: ISODate, end: ISODate): number {
  return daysBetween(start, end) + 1;
}

export function fmtDuration(start: ISODate, end: ISODate): string {
  const n = rangeLength(start, end);
  return n === 1 ? "1 day" : `${n} days`;
}
