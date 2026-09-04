import { LaunchType, Toast, environment, showHUD, showToast, updateCommandMetadata } from "@raycast/api";
import { today } from "./lib/dates";
import { backLabel, isActiveOn } from "./lib/events";
import { fetchFeed, getPrefs } from "./lib/useFeed";

/**
 * No-view command. Its whole job is the subtitle next to "Out Today" in Raycast's root search,
 * so a glance (or typing "out") tells you who not to ping. Refreshes on the interval in
 * package.json; pressing Enter refreshes on demand and shows the details in a HUD.
 */
export default async function OutToday() {
  const userInitiated = environment.launchType === LaunchType.UserInitiated;
  try {
    const events = await fetchFeed(getPrefs().feedUrl);
    const t = today();
    const out = events.filter((e) => e.kind === "pto" && isActiveOn(e, t));
    const names = out.map((e) => e.person ?? e.title);

    const subtitle = out.length === 0 ? "Everyone's in" : names.join(", ");
    await updateCommandMetadata({ subtitle });

    if (userInitiated) {
      const detail =
        out.length === 0
          ? "Nobody's on PTO today"
          : out.map((e) => `${e.person ?? e.title} (${backLabel(e, t)})`).join(" · ");
      await showHUD(detail);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateCommandMetadata({ subtitle: `Couldn't load — ${message}` });
    if (userInitiated) {
      await showToast({ style: Toast.Style.Failure, title: "Couldn't refresh Justworks feed", message });
    }
  }
}
