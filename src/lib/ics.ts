/**
 * Minimal iCalendar parser — enough for the Justworks feed, which only emits all-day VEVENTs
 * with DTSTART/DTEND (VALUE=DATE), SUMMARY, and UID. Handles RFC 5545 line folding.
 */

import { ISODate, addDays } from "./dates";

export interface RawEvent {
  uid: string;
  summary: string;
  /** Inclusive start date. */
  start: ISODate;
  /** Inclusive end date (iCal DTEND is exclusive; we convert). */
  end: ISODate;
}

function unfold(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

/** "20260309" or "20260309T000000Z" → "2026-03-09". */
function toISODate(value: string): ISODate | undefined {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

function unescape(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/\\([,;\\])/g, "$1");
}

export function parseIcs(text: string): RawEvent[] {
  const events: RawEvent[] = [];
  let cur: Partial<RawEvent> & { endExclusive?: ISODate } = {};
  let inEvent = false;

  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      cur = {};
      continue;
    }
    if (line === "END:VEVENT") {
      inEvent = false;
      if (cur.uid && cur.summary && cur.start) {
        // DTEND is exclusive for all-day events; a missing DTEND means a single day.
        const end = cur.endExclusive ? addDays(cur.endExclusive, -1) : cur.start;
        events.push({ uid: cur.uid, summary: cur.summary, start: cur.start, end: end < cur.start ? cur.start : end });
      }
      continue;
    }
    if (!inEvent) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const nameAndParams = line.slice(0, idx);
    const value = line.slice(idx + 1);
    const name = nameAndParams.split(";")[0].toUpperCase();

    switch (name) {
      case "UID":
        cur.uid = value.trim();
        break;
      case "SUMMARY":
        cur.summary = unescape(value).trim();
        break;
      case "DTSTART":
        cur.start = toISODate(value);
        break;
      case "DTEND":
        cur.endExclusive = toISODate(value);
        break;
    }
  }
  return events;
}
