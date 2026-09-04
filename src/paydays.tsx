import { Color, List } from "@raycast/api";
import { daysBetween, fmtDate, fmtRelative, today, weekdayLong } from "./lib/dates";
import { ErrorView, EventItem } from "./lib/ui";
import { useFeed } from "./lib/useFeed";

export default function Paydays() {
  const { data, isLoading, error, revalidate } = useFeed();
  const t = today();
  const all = (data ?? []).filter((e) => e.kind === "payday" || e.kind === "offcycle");
  const upcoming = all.filter((e) => e.start >= t);
  const past = all.filter((e) => e.start < t).reverse();
  const next = upcoming.find((e) => e.kind === "payday");
  const rest = upcoming.filter((e) => e !== next);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search paydays…">
      {error && !data ? (
        <ErrorView error={error} revalidate={revalidate} />
      ) : (
        <>
          {next && (
            <List.Section title="Next Payday">
              <EventItem
                event={next}
                ref={t}
                subtitle={`${weekdayLong(next.start)}, ${fmtDate(next.start)}`}
                accessories={[{ tag: { value: countdown(t, next.start), color: Color.Green } }]}
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
                  accessories={[{ text: fmtRelative(e.start, t) }]}
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
          {!isLoading && all.length === 0 && (
            <List.EmptyView
              title="No paydays in the feed"
              description="Check that Payday is enabled in your subscription filters in Justworks."
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
