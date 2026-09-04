import { List } from "@raycast/api";
import { useState } from "react";
import { addDays, endOfWeek, fmtDate, fmtRelative, today, weekdayShort } from "./lib/dates";
import { JwEvent, celebrationLabel } from "./lib/events";
import { ErrorView, EventItem } from "./lib/ui";
import { useFeed } from "./lib/useFeed";

type Filter = "all" | "birthday" | "anniversary";

export default function Celebrations() {
  const { data, isLoading, error, revalidate } = useFeed();
  const [filter, setFilter] = useState<Filter>("all");
  const t = today();
  const all = (data ?? []).filter(
    (e) => (e.kind === "birthday" || e.kind === "anniversary") && (filter === "all" || e.kind === filter),
  );
  const upcoming = all.filter((e) => e.start >= t);
  const weekEnd = endOfWeek(t);
  const monthEnd = addDays(t, 30);
  const buckets: [string, JwEvent[]][] = [
    ["Today", upcoming.filter((e) => e.start === t)],
    ["This Week", upcoming.filter((e) => e.start > t && e.start <= weekEnd)],
    ["Next 30 Days", upcoming.filter((e) => e.start > weekEnd && e.start <= monthEnd)],
    ["Later", upcoming.filter((e) => e.start > monthEnd)],
  ];
  const past = all
    .filter((e) => e.start < t)
    .reverse()
    .slice(0, 15);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search by name…"
      searchBarAccessory={
        <List.Dropdown tooltip="Type" value={filter} onChange={(v) => setFilter(v as Filter)} storeValue>
          <List.Dropdown.Item title="Birthdays & Anniversaries" value="all" />
          <List.Dropdown.Item title="Birthdays" value="birthday" />
          <List.Dropdown.Item title="Anniversaries" value="anniversary" />
        </List.Dropdown>
      }
    >
      {error && !data ? (
        <ErrorView error={error} revalidate={revalidate} />
      ) : (
        <>
          {buckets.map(
            ([title, items]) =>
              items.length > 0 && (
                <List.Section key={title} title={title} subtitle={`${items.length}`}>
                  {items.map((e) => (
                    <EventItem
                      key={e.id}
                      event={e}
                      ref={t}
                      subtitle={celebrationLabel(e)}
                      accessories={[
                        { text: `${weekdayShort(e.start)} ${fmtDate(e.start)}` },
                        { tag: fmtRelative(e.start, t) },
                      ]}
                      revalidate={revalidate}
                    />
                  ))}
                </List.Section>
              ),
          )}
          {past.length > 0 && (
            <List.Section title="Recent">
              {past.map((e) => (
                <EventItem
                  key={e.id}
                  event={e}
                  ref={t}
                  subtitle={celebrationLabel(e)}
                  accessories={[{ text: fmtDate(e.start) }]}
                  revalidate={revalidate}
                />
              ))}
            </List.Section>
          )}
          {!isLoading && all.length === 0 && (
            <List.EmptyView
              title="Nothing to celebrate in the feed"
              description="Check that Birthday and Anniversary are enabled in your subscription filters in Justworks."
            />
          )}
        </>
      )}
    </List>
  );
}
