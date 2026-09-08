import { Cache } from "@raycast/api";
import { JwEvent } from "./events";
import { fetchFeed, getPrefs } from "./useFeed";

const cache = new Cache();
const KEY = "justworks:feed";
const TTL_MS = 10 * 60 * 1000;

/** Feed events for non-React callers (AI tools, no-view commands). Cached 10 minutes; Justworks regenerates the feed about daily. */
export async function loadEvents(): Promise<JwEvent[]> {
  const raw = cache.get(KEY);
  if (raw) {
    const { at, events } = JSON.parse(raw) as { at: number; events: JwEvent[] };
    if (Date.now() - at < TTL_MS) return events;
  }
  const events = await fetchFeed(getPrefs().feedUrl);
  cache.set(KEY, JSON.stringify({ at: Date.now(), events }));
  return events;
}
