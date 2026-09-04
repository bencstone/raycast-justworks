import { Action, ActionPanel, Icon, Keyboard, List, openExtensionPreferences } from "@raycast/api";
import { fmtDate, fmtRange, fmtRelative, today } from "./dates";
import { JwEvent, backLabel, celebrationLabel, iconFor } from "./events";
import { FeedError, getPrefs } from "./useFeed";

export function CommonActions({ revalidate, extra }: { revalidate?: () => void; extra?: React.ReactNode }) {
  const { companyUrl } = getPrefs();
  return (
    <ActionPanel>
      {extra}
      <Action.OpenInBrowser
        title="Open Justworks Calendar"
        url={companyUrl ?? "https://payroll.justworks.com/calendar"}
      />
      {revalidate && (
        <Action
          title="Refresh"
          icon={Icon.ArrowClockwise}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={revalidate}
        />
      )}
      <Action
        title="Open Extension Preferences"
        icon={Icon.Gear}
        shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
        onAction={openExtensionPreferences}
      />
    </ActionPanel>
  );
}

/** One-line plain-text description of an event, for copying. */
export function describe(e: JwEvent, ref: string = today()): string {
  switch (e.kind) {
    case "pto":
      return `${e.person ?? e.title} out ${fmtRange(e.start, e.end)} (${backLabel(e, ref)})`;
    case "holiday":
      return `${e.title} — ${fmtDate(e.start, { weekday: true })} (${fmtRelative(e.start, ref)})`;
    case "payday":
    case "offcycle":
      return `${e.title} — ${fmtDate(e.start, { weekday: true })} (${fmtRelative(e.start, ref)})`;
    case "birthday":
    case "anniversary":
      return `${e.person ?? e.title}'s ${celebrationLabel(e).toLowerCase()} — ${fmtDate(e.start, { weekday: true })}`;
    default:
      return `${e.title} — ${fmtRange(e.start, e.end)}`;
  }
}

export function EventItem({
  event,
  ref = today(),
  subtitle,
  accessories,
  revalidate,
}: {
  event: JwEvent;
  ref?: string;
  subtitle?: string;
  accessories?: List.Item.Accessory[];
  revalidate?: () => void;
}) {
  return (
    <List.Item
      key={event.id}
      icon={iconFor(event)}
      title={event.title}
      subtitle={subtitle}
      accessories={accessories}
      keywords={event.person ? event.person.split(/\s+/) : undefined}
      actions={
        <CommonActions
          revalidate={revalidate}
          extra={<Action.CopyToClipboard title="Copy" content={describe(event, ref)} />}
        />
      }
    />
  );
}

export function ErrorView({ error, revalidate }: { error: Error; revalidate?: () => void }) {
  const hint = error instanceof FeedError ? error.hint : undefined;
  const needsSetup = /No iCal link/.test(error.message);
  return (
    <List.EmptyView
      icon={needsSetup ? Icon.Gear : Icon.Warning}
      title={error.message}
      description={hint ?? String(error)}
      actions={
        <ActionPanel>
          <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
          {revalidate && <Action title="Retry" icon={Icon.ArrowClockwise} onAction={revalidate} />}
        </ActionPanel>
      }
    />
  );
}
