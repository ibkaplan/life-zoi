# Calorie counter (Nutrition)

Requested by the owner on 2026-11-13: a free calorie counter in LifeZoi with manual entry and a photo of the plate. The owner chose Google's free Gemini tier for the photo, after reading its two conditions (below).

## Where it is

`/academy/meals#calorie-counter`, the first block on the Nutrition page, and the first button in the page's topic row.

| Part | File |
| --- | --- |
| Page block | `src/components/nutrition/calorie-counter.tsx`, styles in `calorie-css.ts` |
| Math, validation | `src/lib/calories/math.ts` |
| Shipped foods and search | `src/lib/calories/local-foods.ts` (the 55 USDA SR Legacy records in `src/lib/wellness/foods.json`) |
| Online search | `src/lib/calories/online.ts`, `GET /api/nutrition/foods?q=&lang=` |
| Photo | `src/lib/calories/photo.ts`, `GET` and `POST /api/nutrition/photo` |
| Diary storage | `src/lib/calories/storage.ts`, `store.ts` (bound in `session-provider.tsx`) |
| Tests | `src/lib/calories/calories.test.ts` |

## How it works

- Search: the shipped USDA foods answer at once and offline, matched in the visitor's language through the catalog. After a short pause the server also asks Open Food Facts (free, no key) and, when `USDA_FDC_API_KEY` is set, USDA FoodData Central. Only the food name and interface language are sent. Answers are cached on the server for a day.
- The member enters grams; calories, protein, fat, and carbohydrate are the source's per-100 g values scaled to the grams. Items can be moved between meals, re-weighed, and deleted. Meals and the day are totalled.
- Photo: the browser shrinks the photo to 1024 px and re-encodes it as JPEG, which removes metadata such as location. The server sends it once to `gemini-3.5-flash-lite` and asks only for food names and rough grams, never calories. Each name is matched to a shipped USDA food; unmatched foods get a "Search for this food" button. Nothing is added until the member ticks and confirms. The photo is not stored.
- Limits per server instance: 3 photos a minute and 15 a day per member, 120 a day in all. When the limit or Google's quota is reached, or there is no key, the page says so and search still works.
- Diary: `localStorage` under `lifezoi.calories.v1.u.<user id>`, up to 90 days and 80 items a day. It is not in Supabase yet, so it stays on one device and browser. "Delete my data" in Settings clears it.

## Conditions of the free Gemini tier (checked 2026-11-13)

From https://ai.google.dev/gemini-api/terms and the pricing page:

- Free-tier input and output may be used to improve Google products, and human reviewers may read them. The page tells members to photograph only food.
- "You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom." LifeZoi does not check the member's country.
- The API is for people 18 and over, and must not be used to give medical advice. The counter is a record, not advice.
- Rate limits are per Google project and shown in AI Studio (https://aistudio.google.com/rate-limit). The project stays free only if the key's Google project has no billing account.

## Not done yet

- The live calls to Open Food Facts, USDA, and Gemini could not be run from the build machine (its proxy refuses them). Their response parsing is unit-tested with sample replies. A person should try search and a photo on the preview.
- Saving the diary to the account (a new Supabase table with row level security) so it follows the member across devices.
- An on-device photo model, if the free Gemini tier stops being suitable.
