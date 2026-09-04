import { Color, Icon, Image } from "@raycast/api";
import { ISODate, addDays, daysBetween, fmtRange, nextWorkday, weekdayShort } from "./dates";
import { RawEvent } from "./ics";

export type EventKind = "pto" | "holiday" | "payday" | "offcycle" | "birthday" | "anniversary" | "other";

export interface JwEvent {
  id: string;
  kind: EventKind;
  /** Display title, e.g. "Labor Day", "Ryan McCahan", "Your Payday". */
  title: string;
  /** Person the event is about, when applicable ("You" for the feed owner). */
  person?: string;
  isSelf: boolean;
  /** Anniversary years, when applicable. */
  years?: number;
  start: ISODate;
  end: ISODate; // inclusive
  raw: string;
}

/** UID prefixes as emitted by Justworks; summary text is the fallback. */
function kindOf(uid: string, summary: string): EventKind {
  const prefix = uid.split("-")[0];
  switch (prefix) {
    case "pto":
      return "pto";
    case "holiday":
      return "holiday";
    case "pay_day_self":
      return "payday";
    case "off_cycle_payment":
      return "offcycle";
    case "birthday":
      return "birthday";
    case "anniversary":
      return "anniversary";
  }
  if (/time off$/i.test(summary)) return "pto";
  if (/birthday$/i.test(summary)) return "birthday";
  if (/anniversary$/i.test(summary)) return "anniversary";
  if (/payday/i.test(summary)) return "payday";
  return "other";
}

const PERSON_RE = /^(.+?)'s? (time off|Birthday|(\d+)-year anniversary)$/i;

export function classify(raw: RawEvent): JwEvent {
  const kind = kindOf(raw.uid, raw.summary);
  const base: JwEvent = {
    id: raw.uid,
    kind,
    title: raw.summary,
    isSelf: /^Your\b/.test(raw.summary),
    start: raw.start,
    end: raw.end,
    raw: raw.summary,
  };

  if (kind === "pto" || kind === "birthday" || kind === "anniversary") {
    if (base.isSelf) {
      base.person = "You";
      const yrs = raw.summary.match(/(\d+)-year/);
      if (yrs) base.years = Number(yrs[1]);
    } else {
      const m = raw.summary.match(PERSON_RE);
      if (m) {
        base.person = m[1];
        if (m[3]) base.years = Number(m[3]);
      }
    }
    base.title = base.person ?? raw.summary;
  }
  return base;
}

/** Merge back-to-back PTO ranges for the same person, bridging gaps that are only weekend days. */
export function mergeAdjacentPto(events: JwEvent[]): JwEvent[] {
  const pto = events
    .filter((e) => e.kind === "pto")
    .sort((a, b) => (a.person ?? "").localeCompare(b.person ?? "") || a.start.localeCompare(b.start));
  const merged: JwEvent[] = [];
  for (const e of pto) {
    const last = merged[merged.length - 1];
    if (last && last.person === e.person && e.start <= nextWorkday(addDays(last.end, 1))) {
      if (e.end > last.end) last.end = e.end;
      continue;
    }
    merged.push({ ...e });
  }
  return [...events.filter((e) => e.kind !== "pto"), ...merged];
}

export function sortByStart(events: JwEvent[]): JwEvent[] {
  return [...events].sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
}

export function isActiveOn(e: JwEvent, day: ISODate): boolean {
  return e.start <= day && day <= e.end;
}

/** First weekday after a PTO range ends. */
export function backOn(e: JwEvent): ISODate {
  return nextWorkday(addDays(e.end, 1));
}

export function backLabel(e: JwEvent, today: ISODate): string {
  const back = backOn(e);
  const n = daysBetween(today, back);
  if (n === 1) return "back tomorrow";
  if (n > 1 && n < 7) return `back ${weekdayShort(back)}`;
  return `back ${fmtRange(back, back)}`;
}

export function iconFor(e: JwEvent): Image.ImageLike {
  switch (e.kind) {
    case "pto":
      return { source: Icon.Airplane, tintColor: Color.Blue };
    case "holiday":
      return { source: Icon.Sun, tintColor: Color.Orange };
    case "payday":
      return { source: Icon.BankNote, tintColor: Color.Green };
    case "offcycle":
      return { source: Icon.Coins, tintColor: Color.Green };
    case "birthday":
      return { source: Icon.Gift, tintColor: Color.Magenta };
    case "anniversary":
      return { source: Icon.Trophy, tintColor: Color.Purple };
    default:
      return Icon.Calendar;
  }
}

export function celebrationLabel(e: JwEvent): string {
  if (e.kind === "birthday") return "Birthday";
  if (e.kind === "anniversary") return e.years ? `${e.years}-year anniversary` : "Work anniversary";
  return e.raw;
}

/** Justworks emits some holidays twice (a "-2" UID variant). Keep one per date, preferring the plainer title. */
export function dedupeHolidays(events: JwEvent[]): JwEvent[] {
  const seen = new Map<string, JwEvent>();
  const out: JwEvent[] = [];
  for (const e of events) {
    if (e.kind !== "holiday") {
      out.push(e);
      continue;
    }
    const prev = seen.get(e.start);
    if (!prev) {
      seen.set(e.start, e);
      out.push(e);
    } else if (e.title.length < prev.title.length) {
      prev.title = e.title;
      prev.raw = e.raw;
    }
  }
  return out;
}
