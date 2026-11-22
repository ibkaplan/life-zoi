# Image credits

Every people and lifestyle photo on LifeZoi's members' pages is listed here and in `src/lib/imagery/registry.ts`. The registry is the source of truth; `src/lib/imagery/registry.test.ts` fails if a photo is missing from this file, used twice, or larger than 200 KB.

## How these photos were chosen

- Owner request, 2026-11-22: LifeZoi is for adults from about 30 onward, not only older people. The set shows people in their 30s, 40s, 50s, 60s, 70s and older, men and women, several ethnicities and body types, and no person or photograph twice.
- Only free licenses: CC0, public domain, CC BY 2.0, CC BY-SA 2.0 and CC BY-SA 4.0. No paid stock service and no API key.
- Each photo was downloaded once from Wikimedia Commons, resized to at most 960 px wide, cropped to 4:5 if it was taller than wide, and saved as WebP in `public/imagery/`. Nothing is hotlinked.
- CC BY and CC BY-SA photos show their author and license on the photo, linked to the source page. Resized and cropped copies of CC BY-SA photos are shared under the same CC BY-SA license.
- Ages in the registry (`ages`) are a rough visual impression, kept only to check variety. They are never shown in the app.

## Photos in `public/imagery/`

| File | Where it appears | Author | License | Source |
| --- | --- | --- | --- | --- |
| `/imagery/daily-morning.webp` | LifeZoi Daily on the members' home, beside the welcome (desktop) | Shixart1985 | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Beautiful_senior_woman_with_curly_hair_doing_yoga_at_home.jpg) |
| `/imagery/daily-calm.webp` | LifeZoi Daily page `/daily`, beside the welcome (desktop) | Amy Serin | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Peaceful-senior-woman-meditating-outdoors.jpg) |
| `/imagery/nutrition.webp` | Nutrition page, beside the heading (desktop) | Shixart1985 | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Elderly_woman_prepares_vegetables_while_cooking_in_a_home_kitchen_during_the_day.jpg) |
| `/imagery/change-lab.webp` | Dashboard Change Lab tile; Change Lab page | Clem Onojeghuo | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Lady_on_a_bike_(Unsplash).jpg) |
| `/imagery/assessment.webp` | Dashboard assessment tile; first step of the Lifestyle Assessment | Shixart1985 | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Woman_writing_notes_while_enjoying_a_fresh_fruit_platter_and_juice.jpg) |
| `/imagery/what-if.webp` | Dashboard WHAT IF? tile | pasja1000 (Pixabay) | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Senior-3336451_1920.jpg) |
| `/imagery/progress.webp` | My Wellness Score & Progress | Ed Yourdon | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jogging_couple.jpg) |
| `/imagery/energy.webp` | Topic: Energy & wellness | Ryan (Toronto) | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Salsa_dancing_(7564732146).jpg) |
| `/imagery/nutrition-topic.webp` | Topic: Nutrition | Leonie Wise | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Healthy_Grocery_Shopping_(Unsplash).jpg) |
| `/imagery/movement.webp` | Topic: Fitness & movement | Shixart1985 | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Fitness_enthusiast_performs_plank_exercise_at_home_on_yoga_mat.jpg) |
| `/imagery/sleep.webp` | Topic: Sleep & relaxation | Shixart1985 | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Cozy_modern_bedroom_with_plush_pillows_and_elegant_drapes_in_bright_daylight.jpg) |
| `/imagery/brain.webp` | Brain & Habit Quiz page; also `DAILY_PHOTOS.music` | Shixart1985 | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Older_man_plays_acoustic_guitar_while_sitting_in_a_chair.jpg) |
| `/imagery/brain-reading.webp` | Topic: Brain health | Tamarcus Brown | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Reading_in_Atlanta_(Unsplash).jpg) |
| `/imagery/heart.webp` | Topic: Heart health | U.S. Forest Service, Pacific Northwest Region | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Latino_Family_using_Accessible_Trail_at_Lost_Lake-Mt_Hood_(26364107981).jpg) |
| `/imagery/longevity.webp` | Topic: Longevity | Anna Frodesiak | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Haikou_People%27s_Park_-_people_practicing_t%27ai_chi_ch%27uan_(tai_chi)_-_01.jpg) |

## Original illustrations

These were drawn for LifeZoi as SVG code. They have no outside source.

| Component | What it is |
| --- | --- |
| `src/components/imagery/assistant-mascot.tsx` | The Wellness Assistant's character: a calm helper robot with a heart emblem, in royal purple, lavender, teal, sage, ivory and gold. Used on the dashboard tile and the Wellness Assistant page. |
| `src/components/imagery/topic-glyph.tsx` | Seven small line drawings (sun, apple, walker, moon, brain, heart with pulse, tree) for the topic cards. |
| `src/components/companion/art.tsx` | Earlier LifeZoi illustrations, unchanged. |

## Photos that were already on `main`

Unchanged by this work. Landing-page images are in `public/home/`, and page photos in `public/pages/` with credits in `src/components/page-photo.tsx` (CC0, via Wikimedia Commons).

## Adding a photo

1. Use a CC0, public-domain or CC BY / CC BY-SA photo. Check that the person or photo is not already in the registry.
2. Resize to at most 960 px wide, save as WebP under 200 KB in `public/imagery/`.
3. Add an entry to `PHOTOS` in `src/lib/imagery/registry.ts` with `alt` text in `msg(...)`, the credit, and a rough `ages` band.
4. Add a row here, add the `alt` text to the uk, ru and el catalogs (`node scripts/i18n-merge.mjs . pages <file>`), and run `npm test`.
