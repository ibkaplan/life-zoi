# Brain & Habit Quiz: daily brain training

Owner request, 2026-11-24. The existing quiz at `/brain-quiz` was upgraded in place. No new page or route was added, and the seven categories, points, games, Health Facts Quiz, and Focus links stay as they were.

## What changed

- **Daily Challenge (`/brain-quiz/daily`).** Five parts per local calendar day. The five categories come from an interleaved ring of the seven (neighbouring days never use the same set) and the levels follow two easy, two medium, one hard, in a different order each day. Each slot picks a question that was never answered and not shown in the last 30 days; Logic and Numbers fall back to built puzzles; Memory and Attention build a new layout from a daily id such as `M-pairs-e_d327`. The chosen five are saved (`round`) the first time the page opens, so a refresh or another device shows the same set. A day started under the old fixed rotation keeps its old set (`dailyRound`).
- **Bank that can grow.** `src/lib/brain-quiz/generated.ts` builds Logic and Numbers questions from a seed (`GL-e-0042`, `GN-h-0007`). 1,000 seeds per level and category, so 6,000 puzzles; answers are computed, never typed. Add a rule or raise `SEEDS_PER_LEVEL` to grow it. Written questions are still added to the `questions-*.ts` files and appear automatically in rotation and on category pages.
- **Rotation everywhere.** Category pages show "Fresh for you today" above the full list, using the same picker (`freshFor`). `seen` records the day each activity was last shown.
- **Daily copies.** A daily copy (`L04_d327`) is only used when every question in a category has been answered; it scores as that day's activity, and marks the original as answered so practice does not score it again.
- **Points.** Unchanged: easy 10, medium 20, hard 30, daily bonus 25. The bonus is keyed by date (`bonus:YYYY-MM-DD` in `awarded`, plus `dailyDone`) and is never added twice.
- **Local time zone.** Dates come from `localISODate()` in the browser. `use-local-today.ts` updates at local midnight and when the tab regains focus, so an open page rolls over to the new set.
- **My Brain Journey.** Totals (points, questions answered, right, not right, daily challenges, streaks), next milestones with progress bars, a 12-week calendar of days played, points by week, answers by week, day-by-day activity history, and more achievements (500/1,000/2,500 points, 14/30-day streaks, 5/10/30 dailies, three perfect dailies, 100 answers, ten hard, five days in one week).
- **Welcome.** The quiz page opens with a short welcome, today's status, and "New today": a logic puzzle, a memory exercise, an attention game, the health Fact of the Day (from the sourced Did You Know? facts), a focus session, and the brain games.

## Where it is saved

Brain progress moved from the profile row (`profiles.session_state`, 24 KB limit shared with everything else) to the companion record (`companion_state`, the same table that already holds Focus, Breathe, and game history, 256 KB). No migration was needed. On first load, a non-empty profile copy is adopted once; the profile copy is left as it was. Limits: 3,000 scored ids, 400 days of history and daily scores, 1,500 `seen` entries. When the account copy grows too large, `fitForAccount` trims `seen` and old days first, never points or scored ids.

## Checked

- `src/lib/brain-quiz/daily-training.test.ts` covers the owner's tests 1 to 7: five parts finished with points and one bonus; reload keeps set, answers, and points; the next day has five different questions; yesterday and today both in history; double bonus refused; category rotation over 30 days and 6,000 built puzzles; local-midnight reset in four time zones, daylight-saving and year-end days.
- Clicked through in a local browser with a sign-in bypass that was not committed (guest storage, faked clock in Europe/Kyiv): day one finished, reload, next day after midnight, journey, category pages. Screenshots in the project files folder `brain-daily-training/`.

## Not checked

- Not run against the real Supabase account. Two tabs open at once still follow the companion rule that the newer save wins.
- Health fact headlines are shown in English, as on the facts pages.
