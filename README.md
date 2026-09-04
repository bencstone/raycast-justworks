# Justworks for Raycast

Who's out, company holidays, paydays, and teammate celebrations — pulled from your **personal Justworks iCal subscription**. No login, no API keys: Justworks already publishes this data as a calendar feed, and this extension just reads it.

## Setup (about a minute)

1. In Justworks, open **Calendar → Filters → Your subscription**.
2. Tick the event types you want (Time off, Company holiday, Payday, Birthday, Anniversary) and click **Create iCal subscription link**.
3. Copy the link and paste it into this extension's **iCal Subscription Link** preference (Raycast will ask on first run).

The link is personal — it's tied to your Justworks account and shows what you're allowed to see. Don't share it; if it leaks, create a new one in Justworks and update the preference.

## Commands

- **Justworks Overview** — who's out today, the next holiday, your next payday, celebrations in the next two weeks.
- **Time Off** — everyone's time off, grouped by today / tomorrow / this week / next week / later, with a "back Mon" hint.
- **Company Holidays** — the holiday list with a countdown to the next one.
- **Paydays** — next payday and the upcoming schedule (including off-cycle runs).
- **Birthdays & Anniversaries** — upcoming celebrations, filterable by type.

Every item has **Copy** (a one-line summary), **Open Justworks Calendar**, and **⌘R** to refresh. Data is cached between runs and refreshed in the background; Justworks regenerates the feed roughly daily.

## Notes

- Data is only as good as the feed: PTO shows once it's approved in Justworks.
- "Back Mon" skips weekends but doesn't know about holidays.
- Built and maintained locally (`npm install && npx ray develop`). Not published to the Raycast Store.
