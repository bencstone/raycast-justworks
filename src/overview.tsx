import { Action, Icon, List } from "@raycast/api";
import { addDays, daysBetween, endOfWeek, fmtDate, fmtRange, fmtRelative, today, weekdayShort } from "./lib/dates";
import { JwEvent, backLabel, celebrationLabel, isActiveOn } from "./lib/events";
import { CommonActions, ErrorView, EventItem, describe } from "./lib/ui";
import { useFeed } from "./lib/useFeed";
import Holidays from "./holidays";
import Paydays from "./paydays";
import WhosOut from "./whos-out";
import Celebrations from "./celebrations";

export default function Overview() {
  const { data, isLoading, error, revalidate } = useFeed();
  const t = today();
  const events = data ?? [];

  const outToday = events.filter((e) => e.kind === "pto" && isActiveOn(e, t));
  const weekEnd = endOfWeek(t);
  const outLaterThisWeek = events.filter((e) => e.kind === "pto" && e.start > t && e.start <= weekEnd);
  const nextHoliday = events.find((e) => e.kind === "holiday" && e.end >= t);
  const nextPayday = events.find((e) => e.kind === "payday" && e.start >= t);
  const celebrations = events.filter(
    (e) => (e.kind === "birthday" || e.kind === "anniversary") && e.start >= t && e.start <= addDays(t, 14),
  );

  const summary = [
    outToday.length ? `Out today: ${outToday.map((e) => e.person).join(", ")}` : "Nobody out today",
    nextHoliday ? `Next holiday: ${describe(nextHoliday, t)}` : undefined,
    nextPayday ? `Next payday: ${fmtDate(nextPayday.start, { weekday: true })}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Justworks at a glance…">
      {error && !data ? (
        <ErrorView error={error} revalidate={revalidate} />
      ) : (
        <>
          <List.Section title={`Out Today · ${fmtDate(t, { weekday: true })}`} subtitle={countLabel(outToday.length)}>
            {outToday.length === 0 ? (
              <List.Item
                icon={Icon.CheckCircle}
                title="Everyone's in"
                subtitle="No time off on the calendar today"
                actions={
                  <CommonActions
                    revalidate={revalidate}
                    extra={<Action.CopyToClipboard title="Copy Summary" content={summary} />}
                  />
                }
              />
            ) : (
              outToday.map((e) => (
                <EventItem
                  key={e.id}
                  event={e}
                  ref={t}
                  subtitle={fmtRange(e.start, e.end)}
                  accessories={[{ text: backLabel(e, t) }]}
                  revalidate={revalidate}
                />
              ))
            )}
          </List.Section>

          {outLaterThisWeek.length > 0 && (
            <List.Section title="Out Later This Week">
              {outLaterThisWeek.map((e) => (
                <EventItem
                  key={e.id}
                  event={e}
                  ref={t}
                  subtitle={fmtRange(e.start, e.end)}
                  accessories={[{ text: fmtRelative(e.start, t) }]}
                  revalidate={revalidate}
                />
              ))}
            </List.Section>
          )}

          <List.Section title="Coming Up">
            {nextHoliday && (
              <EventItem
                event={nextHoliday}
                ref={t}
                subtitle={fmtDate(nextHoliday.start, { weekday: true })}
                accessories={[{ tag: countdown(nextHoliday, t) }]}
                revalidate={revalidate}
              />
            )}
            {nextPayday && (
              <EventItem
                event={nextPayday}
                ref={t}
                subtitle={fmtDate(nextPayday.start, { weekday: true })}
                accessories={[{ tag: countdown(nextPayday, t) }]}
                revalidate={revalidate}
              />
            )}
          </List.Section>

          {celebrations.length > 0 && (
            <List.Section title="Celebrations · Next 2 Weeks">
              {celebrations.map((e) => (
                <EventItem
                  key={e.id}
                  event={e}
                  ref={t}
                  subtitle={celebrationLabel(e)}
                  accessories={[{ text: `${weekdayShort(e.start)} ${fmtDate(e.start)}` }]}
                  revalidate={revalidate}
                />
              ))}
            </List.Section>
          )}

          <List.Section title="More">
            <List.Item
              icon={Icon.Airplane}
              title="Time Off"
              subtitle="Everyone's upcoming time off"
              actions={
                <CommonActions
                  revalidate={revalidate}
                  extra={<Action.Push title="Show Who Is out" icon={Icon.Airplane} target={<WhosOut />} />}
                />
              }
            />
            <List.Item
              icon={Icon.Sun}
              title="Company Holidays"
              actions={
                <CommonActions
                  revalidate={revalidate}
                  extra={<Action.Push title="Show Holidays" icon={Icon.Sun} target={<Holidays />} />}
                />
              }
            />
            <List.Item
              icon={Icon.BankNote}
              title="Paydays"
              actions={
                <CommonActions
                  revalidate={revalidate}
                  extra={<Action.Push title="Show Paydays" icon={Icon.BankNote} target={<Paydays />} />}
                />
              }
            />
            <List.Item
              icon={Icon.Gift}
              title="Birthdays & Anniversaries"
              actions={
                <CommonActions
                  revalidate={revalidate}
                  extra={<Action.Push title="Show Celebrations" icon={Icon.Gift} target={<Celebrations />} />}
                />
              }
            />
          </List.Section>
        </>
      )}
    </List>
  );
}

function countLabel(n: number): string {
  return n === 1 ? "1 person" : `${n} people`;
}

function countdown(e: JwEvent, t: string): string {
  const n = daysBetween(t, e.start);
  if (n <= 0) return "Today";
  if (n === 1) return "Tomorrow";
  return `${n} days`;
}
