# Main Menu Design Improve

Date: 2026-05-10
Screen: UltyMyLife main menu
Current screenshot: `references/current.png`

## Lazyweb References

- Halo Habits, screenshot 17001: dark habit dashboard with a compact streak unlock state, top actions, bottom navigation, and a clear day-progress indicator.
- Impulse, screenshot 7388: profile dashboard with current/best streak numbers, weekly calendar, achievements, and progress bars.
- Headway, screenshot 3059: home dashboard with "Your daily mission", timed tasks, completion state, and a primary next action.
- Zero, screenshot 64044: today dashboard with progress rings and a central completion indicator.
- Acadex, screenshot 72420: productivity dashboard with greeting, quick stats, task progress, shortcuts, and bottom tabs.

## Applied Direction

- Main hero now behaves like a daily dashboard instead of a static profile card: greeting, selected metrics, a progress rail, and a ring stack with central completion percentage.
- Added a separate "Mission of the day" card based on the Headway/Acadex pattern, using the app's existing focus target and one-tap section navigation.
- Section cards now show visual progress rails for every section, taking the summary progress data from `MainMenu.jsx`.
- Empty section metrics keep the section accent instead of looking disabled, so "0" reads as "start here" rather than "dead state".
- The bottom navigation remains fixed and the existing section-opening, widget settings, pin, hide, and restore flows are unchanged.

## Implementation Notes

- `src/assets/Pages/MainMenu.jsx` now exposes `summary.metrics` for all main sections and adds `summary.focus.progress`.
- `src/assets/Pages/MainMenuRedesign.jsx` uses those values for the hero ring stack, daily mission card, and per-section progress rails.
- Verified with `npm run build`, `graphify update .`, and a headless Chrome render after closing onboarding.
