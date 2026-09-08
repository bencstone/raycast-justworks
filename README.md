# Justworks for Raycast

Who's out, company holidays, paydays, and teammate celebrations — pulled from your **personal Justworks iCal subscription**. No login, no API keys: Justworks already publishes this data as a calendar feed, and this extension just reads it.

## Setup (about a minute)

1. In Justworks, open **Calendar → Filters → Your subscription**.
2. Tick the event types you want (Time off, Company holiday, Payday, Birthday, Anniversary) and click **Create iCal subscription link**.
3. Copy the link and paste it into this extension's **iCal Subscription Link** preference (Raycast will ask on first run).

The link is personal — it's tied to your Justworks account and shows what you're allowed to see. Don't share it; if it leaks, create a new one in Justworks and update the preference.

## Commands

- **Out Today** — the one to glance at before you ping someone. It shows today's PTO names as its subtitle right in the Raycast command list (like a now-playing command), refreshes hourly in the background, and **Enter** refreshes it now and shows who's back when.
- **Justworks Overview** — who's out today, the next holiday, your next payday, celebrations in the next two weeks.
- **Time Off** — everyone's time off, grouped by today / tomorrow / this week / next week / later, with a "back Mon" hint.
- **Company Holidays** — the holiday list with a countdown to the next one.
- **Paydays** — next payday and the upcoming schedule (including off-cycle runs).
- **Birthdays & Anniversaries** — upcoming celebrations, filterable by type.

Every item has **Copy** (a one-line summary), **Open Justworks Calendar**, and **⌘R** to refresh. Data is cached between runs and refreshed in the background; Justworks regenerates the feed roughly daily.

## Ask it in Raycast AI

The extension is also an AI Extension: in AI Chat or Quick AI, address it as `@justworks` — "@justworks who's out today", "@justworks when is the next holiday", "@justworks when is Karissa out next", "@justworks any anniversaries this month". Five read-only tools back this (who's out on a day, search time off, holidays, paydays, celebrations); nothing writes to Justworks. You can also add it to an AI Command or a Preset so it's always in scope.

## Notes

- Data is only as good as the feed: PTO shows once it's approved in Justworks.
- **Partial days show as full days.** Justworks records partial PTO as hours per day ("4h on Oct 2"), not as a morning or afternoon, and the calendar feed carries dates only. So someone taking a half day appears in Out Today just like someone off all day. Treat it as "has some time off today," not "unreachable all day."
- "Back Mon" skips weekends but doesn't know about holidays.
- Built and maintained locally (`npm install && npx ray develop`). Not published to the Raycast Store.
