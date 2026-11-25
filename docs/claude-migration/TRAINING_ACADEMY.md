# LifeZoi Training Academy

Owner request, 2026-11-24: a Personal Growth & Training Academy with five complete courses, 50 lessons, interactive practice, achievements, and progress saved to the account. It is separate from the Nutrition and Fitness Academy at `/academy`, which is unchanged.

## Where it is

| Page | Path |
| --- | --- |
| Academy home: welcome, My Learning Journey, five course cards, Daily Growth Challenge, voice setting | `/training-academy` |
| Course page: goal, objectives, difficulty, progress, all ten lessons with Start / Continue / Review | `/training-academy/<course>` |
| Lesson page: seven parts plus Complete lesson | `/training-academy/<course>/lesson-<n>` |
| Completion summary: certificate to print or save as PDF, and a text download | `/training-academy/<course>/summary` |
| My Growth Journey: courses, completed lessons, achievements, learning history, saved reflections, Continue shortcuts | `/training-academy/journey` |

Menu: Brain & Mind section ("Training Academy", "My Growth Journey"), and the footer.

Code: `src/lib/growth-academy/` (data format `types.ts`, courses in `courses/`, `catalog.ts`, `progress.ts`, `achievements.ts`, `challenges.ts`, `feedback.ts`, `store.ts`), `src/components/growth-academy/`, pages in `src/app/(members)/training-academy/`.

## Courses and lessons

Five courses, ten lessons each, every one fully written in English: Confidence & Self-Esteem, Mindfulness, Communication Skills, Emotional Intelligence, Resilience & Motivation. All text is original LifeZoi writing. Nothing is copied from books or courses, there are no statistics or citations, and no promises of results.

Every lesson has the same parts: Introduction, Learn (two to four sections), Real-life example, Exercise (steps, boxes to type in, an optional timer for timed practices), Practice (a scenario with a free-text answer, example responses to pick, built-in feedback, Practice again, Save), Reflect (two or three questions), Key takeaways, and Complete lesson. Lessons about anger, anxiety, stress, triggers, setbacks, and difficult conversations show a care note that points to a doctor, a mental health professional, or emergency services. Every page says the Academy is educational and not mental health treatment, therapy, or medical advice.

### Adding a course

Write `src/lib/growth-academy/courses/<id>.ts` exporting a `GrowthCourse` (see `types.ts`), add it to `GROWTH_COURSES` in `catalog.ts`, and add `growth-<id>.json` translations of its `msg()` strings to `src/lib/i18n/catalog/{uk,ru,el}/` (imported in each `index.ts`). The home page, course pages, journey, achievements, and tests pick it up. `requiredLessons` can lower how many lessons complete the course; by default all are needed.

## Progress rules (tested in `academy.test.ts`)

- Opening a lesson marks it In progress and makes it the course's current lesson. Only the Complete lesson button marks it Completed. Opening the last lesson never completes a course.
- A course is completed when every required lesson is completed. Its completion date is saved once and never moves.
- Saved per course: started date, last activity, current lesson, completed date, lessons completed and remaining, percent, exercises done. Saved per lesson: status, started, last activity, completed date, last part viewed, exercise done, practice attempts, time spent, and answers the person chose to save.
- Typed text is saved to the account only when the person presses Save. Until then it stays in that browser tab (`sessionStorage`). Each lesson's saved text can be deleted in My Growth Journey; progress stays.
- Time counts only while a lesson page is open and visible, in 15-second steps, saved about once a minute.
- "Learning days in a row" counts days with a lesson or challenge. A missed day is never shown as a loss.
- Daily Growth Challenge: one of 30 short challenges per local date, recorded on its own. It never changes lesson or course progress and is never needed for completion.

## Achievements

Given once, with the date, never removed: First Lesson Completed, Three Lessons Completed, Ten Lessons Completed, First Reflection Saved, First Daily Challenge, Seven Daily Challenges (any days), First Course Completed, Five Courses Completed, and one per course (Confidence Builder, Mindfulness Explorer, Communication Champion, Emotional Awareness, Resilience in Action). A course achievement comes with a congratulations message, the completion summary, and a suggestion for the next course.

## Storage and privacy

- Signed-in accounts save to their own row in `academy_state` (new migration `supabase/migrations/20261124200000_academy_state.sql`, the same row level security as `companion_state`, 1 MB size check, deleted with the account). A copy stays in the browser. When the account and browser copies differ, they are joined: a completed lesson stays completed, the earliest start and latest activity win, achievements are kept.
- Until the migration runs, signed-in people see "Saved in this browser on this device… not on other devices yet." Nothing is lost; the next load after the table exists uploads the browser copy.
- Text limits keep the row under the size check: 1,500 characters per box, three saved practice answers per lesson, 300 history entries. If it still grows too large, older history and extra practice answers are trimmed first; reflections and exercise answers are not.
- The labeled sample saves nothing. "Clear my data" clears the Academy too.
- Nothing is sent to an AI or any outside service.

## Voice

Each lesson part has the existing LifeZoi Listen player (`ReadAloud`): pause, resume, replay, stop, speed and voice choice. The exercise is read as steps with Next step and Previous step. Reflection questions are read; text boxes are never read. "Show Listen buttons" turns it off for the whole Academy (saved with progress). My Growth Journey is a personal page, so its page-level Listen uses only on-device voices. No new voice provider and no cost.

## Practice feedback

Built in, no AI: it looks for each lesson's own cue words (whole words) and shows kind, specific notes plus "You might check" points. It never scores or criticises. An AI option was not added; the free Gemini route is reserved for the wellness page and the photo reader, and the brief says the core must work without paid AI.

## Languages

Everything in the Academy is in English, Ukrainian, Russian, and Greek: menus, buttons, course titles, descriptions, objectives, lesson titles and skills, achievements, daily challenges, and, since 2026-11-25, every lesson body (introduction, learning sections, stories, exercise steps and boxes, practice prompts, example answers, feedback notes, reflection questions, takeaways, and care notes). English stays the fallback for any text without a translation.

- Lesson bodies are translated in `src/lib/i18n/catalog/<locale>/growth-<course>-lessons.json`, keyed by the English text like every other catalog file. `src/lib/i18n/sources/growth-academy.ts` lists them (through `lessonBodyText` in `src/lib/growth-academy/lesson-text.ts`), so the catalog test fails if a new or changed English sentence has no translation.
- Practice feedback words: each cue has a catalog entry `cue: <english words>` whose value is `cue: ` plus words in that language separated by ` | `, for example `"cue: thank | thanks": "cue: спасиб | благодар"`. A word of four or more letters also matches longer words starting with it, so stems cover word endings. Accents (Greek tonos, ё, й) are ignored when matching. English cue words always apply as well. `academy.test.ts` checks that every cue has a list in each language and that each translated example answer still gets a kind note whenever the English one does.
- Listen reads the translated text with the device's voice for that language.
- The lesson part "Practice" now has its own translation («Практика», «Εξάσκηση»). It used to share the nutrition recipe difficulty "Practice" («Нужна практика»), so that recipe label is now "Takes practice". The lesson pager says "Back" («Назад», «Πίσω») instead of "Previous", whose translation fits the wellness-score card but not a pager.
- The translations were written by Claude and still need a read by a native speaker; the review list is `docs/claude-migration/TRAINING_ACADEMY_TRANSLATION_REVIEW.md`. Screenshots: `docs/screenshots/training-academy-languages/` (taken locally with a temporary sign-in bypass that was not committed). Change English text and its translations together.

## Not checked

- Not clicked through in a browser while signed in: the members' pages need a real sign-in and the local sign-in bypass used before was not allowed in this session. Check `/training-academy` on a phone, a tablet, and a computer on the Vercel preview.
- Not run against the real Supabase account until the migration is applied after merge.
