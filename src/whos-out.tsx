import { List } from "@raycast/api";
import { useState } from "react";
import { addDays, endOfWeek, fmtDuration, fmtRange, fmtRelative, today } from "./lib/dates";
import { JwEvent, backLabel, isActiveOn } from "./lib/events";
import { ErrorView, EventItem } from "./lib/ui";
import { useFeed } from "./lib/useFeed";

type Horizon = "30" | "60" | "90" | "all";

export default function WhosOut() {
  const { data, isLoading, error, revalidate } = useFeed();
  const [horizon, setHorizon] = useState<Horizon>("60");
  const t = today();
  const limit = horizon === "all" ? "9999-12-31" : addDays(t, Number(horizon));

  const pto = (data ?? []).filter((e) => e.kind === "pto" && e.end >= t && e.start <= limit);
  const now = pto.filter((e) => isActiveOn(e, t));
  const tomorrow = addDays(t, 1);
  const weekEnd = endOfWeek(t);
  const nextWeekEnd = addDays(weekEnd, 7);
  const upcoming = pto.filter((e) => e.start > t);
  const buckets: [string, JwEvent[]][] = [
    ["Tomorrow", upcoming.filter((e) => e.start === tomorrow)],
    ["Later This Week", upcoming.filter((e) => e.start > tomorrow && e.start <= weekEnd)],
    ["Next Week", upcoming.filter((e) => e.start > weekEnd && e.start <= nextWeekEnd)],
    ["Later", upcoming.filter((e) => e.start > nextWeekEnd)],
  ];

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search by name…"
      searchBarAccessory={
        <List.Dropdown tooltip="How far ahead" value={horizon} onChange={(v) => setHorizon(v as Horizon)} storeValue>
          <List.Dropdown.Item title="Next 30 days" value="30" />
          <List.Dropdown.Item title="Next 60 days" value="60" />
          <List.Dropdown.Item title="Next 90 days" value="90" />
          <List.Dropdown.Item title="Everything" value="all" />
        </List.Dropdown>
      }
    >
      {error && !data ? (
        <ErrorView error={error} revalidate={revalidate} />
      ) : (
        <>
          <List.Section title="Out Today" subtitle={now.length ? `${now.length}` : "everyone's in"}>
            {now.map((e) => (
              <EventItem
                key={e.id}
                event={e}
                ref={t}
                subtitle={fmtRange(e.start, e.end)}
                accessories={[{ text: backLabel(e, t) }]}
                revalidate={revalidate}
              />
            ))}
          </List.Section>
          {buckets.map(
            ([title, items]) =>
              items.length > 0 && (
                <List.Section key={title} title={title} subtitle={`${items.length}`}>
                  {items.map((e) => (
                    <EventItem
                      key={e.id}
                      event={e}
                      ref={t}
                      subtitle={fmtRange(e.start, e.end)}
                      accessories={[{ text: fmtDuration(e.start, e.end) }, { tag: fmtRelative(e.start, t) }]}
                      revalidate={revalidate}
                    />
                  ))}
                </List.Section>
              ),
          )}
          {!isLoading && pto.length === 0 && (
            <List.EmptyView title="No time off in this window" description="Try a longer horizon from the dropdown." />
          )}
        </>
      )}
    </List>
  );
}
