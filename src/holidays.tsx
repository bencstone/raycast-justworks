import { Color, List } from "@raycast/api";
import { daysBetween, fmtDate, fmtRelative, isWeekend, today, weekdayLong } from "./lib/dates";
import { ErrorView, EventItem } from "./lib/ui";
import { useFeed } from "./lib/useFeed";

export default function Holidays() {
  const { data, isLoading, error, revalidate } = useFeed();
  const t = today();
  const holidays = (data ?? []).filter((e) => e.kind === "holiday");
  const upcoming = holidays.filter((e) => e.end >= t);
  const past = holidays.filter((e) => e.end < t).reverse();
  const [next, ...rest] = upcoming;

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search holidays…">
      {error && !data ? (
        <ErrorView error={error} revalidate={revalidate} />
      ) : (
        <>
          {next && (
            <List.Section title="Next Holiday">
              <EventItem
                event={next}
                ref={t}
                subtitle={`${weekdayLong(next.start)}, ${fmtDate(next.start)}`}
                accessories={[{ tag: { value: countdown(t, next.start), color: Color.Orange } }]}
                revalidate={revalidate}
              />
            </List.Section>
          )}
          {rest.length > 0 && (
            <List.Section title="Upcoming" subtitle={`${rest.length}`}>
              {rest.map((e) => (
                <EventItem
                  key={e.id}
                  event={e}
                  ref={t}
                  subtitle={`${weekdayLong(e.start)}, ${fmtDate(e.start)}`}
                  accessories={[
                    ...(isWeekend(e.start) ? [{ text: "weekend" }] : []),
                    { text: fmtRelative(e.start, t) },
                  ]}
                  revalidate={revalidate}
                />
              ))}
            </List.Section>
          )}
          {past.length > 0 && (
            <List.Section title="Past" subtitle={`${past.length}`}>
              {past.map((e) => (
                <EventItem
                  key={e.id}
                  event={e}
                  ref={t}
                  subtitle={`${weekdayLong(e.start)}, ${fmtDate(e.start)}`}
                  revalidate={revalidate}
                />
              ))}
            </List.Section>
          )}
          {!isLoading && holidays.length === 0 && (
            <List.EmptyView
              title="No holidays in the feed"
              description="Check that Company holiday is enabled in your subscription filters in Justworks."
            />
          )}
        </>
      )}
    </List>
  );
}

function countdown(t: string, day: string): string {
  const n = daysBetween(t, day);
  if (n <= 0) return "Today";
  if (n === 1) return "Tomorrow";
  return `in ${n} days`;
}
