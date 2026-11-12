# Wellness Library video collection

Route: `/academy/move/library` (the existing Wellness Library). The 14 activity categories there now open a video collection with six lengths each: 10, 15, 20, 30, 45, and 60 minutes. The text-based guided sessions (for example "Gentle march" under Dance Fitness) are no longer shown on this page. They are still used by activity cards elsewhere in the app, which were not changed.

## How it works

1. Step 1: the person picks one of the 14 activities (large colourful buttons with a count of lengths that have a video).
2. Step 2: six length cards appear. A card with a video shows the YouTube thumbnail, "N-minute Activity", the YouTube title, level, position, instructor (the channel), and a large PLAY VIDEO button. A length without a checked video shows a dashed "Not available yet" tile with no thumbnail and no play button. Nothing is substituted.
3. Step 3: PLAY VIDEO opens a panel with YouTube's official embedded player (`youtube-nocookie.com/embed`). LifeZoi's own large buttons send YouTube's documented player commands (`enablejsapi=1`, postMessage; no YouTube script or key is loaded): Play / Pause / Resume, Restart, Full screen, a progress bar with time, and a volume slider with Mute. YouTube's own controls remain as a fallback.
4. "I finished this class" records the minutes as exercise for today, like Daily Movement.

Level chips (All levels, Beginner, Gentle, Intermediate, Advanced) choose which video a length shows when there is more than one. Age is never read. Chair Exercises only contain Gentle or Beginner classes, and Chair, Balance, Tai Chi, Qigong, and Yoga players show the fall-support line under the general safety line.

## Files

- `src/lib/wellness-library/video-library.ts`: the data (`LIBRARY_VIDEO_SEEDS`) and helpers (`slotsFor`, `missingSlots`). Each entry has YouTube id, activity, minutes, exact title, channel (instructor), handle, level, position, equipment, and check date. Derived fields: unique id, watch URL, embed URL, thumbnail URL, language, license text, attribution.
- `src/lib/wellness-library/video-library.test.ts`: 14 × 6 slots, title states the length, official URLs only, no duplicates, missing slots stay empty.
- `src/components/companion/video-library.tsx`: the page section and player.
- `src/components/companion/library-view.tsx`: now renders the collection; brain games links and the earlier catalog videos stay below it.
- `scripts/add-video.mjs --library <activity>`: checks a YouTube link with oEmbed and prints an entry.
- `src/lib/wellness-library/link-check.live.test.ts`: `npm run check:library` now also re-checks every collection video.

## Adding a video (no rebuild of the library)

On a computer with internet:

```
npm run video:add -- https://www.youtube.com/watch?v=VIDEO_ID --library qigong
```

Paste the printed `s(...)` line into `LIBRARY_VIDEO_SEEDS` under its activity, check the guessed level and position, run `npm test`, and open a pull request. The first entry for an activity and length is the one that plays; later ones are alternatives for other levels.

## What was verified, and what was not

- Every video id came from web search results for YouTube, not from memory. Each one listed below answered HTTP 200 from YouTube's public oEmbed endpoint, which means public and embeddable. Title and channel are copied from that answer. Checks were on 2026-11-12 (two rounds, because the web check service allows about 100 checks an hour), except entries marked 2026-11-10 or 2026-11-11, which reuse the Chair Yoga Studio and Daily Movement checks.
- The build machine cannot reach YouTube (proxy 403), so the oEmbed checks went through a web fetch service with an hourly limit. Playback inside the page could not be watched from the build machine: the screenshots show the player frame and LifeZoi's controls, but not the video itself or the YouTube thumbnails. A person should open the page on a normal connection and press play on each card. `npm run check:library` re-runs the embed check.
- Not verified: real player length (the length is the one written in the title and labelled "from the title"), whether an instructor is on screen for the whole class, the level and position (LifeZoi's reading of the title), and spoken language beyond the English title.
- Licence: these are standard-licence YouTube videos, not Creative Commons. They are embedded with the official player, which YouTube's terms allow, and never downloaded. No Pixabay, Pexels, or Mixkit clip was used: those sites offer short stock clips without an instructor leading a full class, so none fit a 10–60 minute follow-along. Before a paid LifeZoi subscription launches, a person should re-read YouTube's Terms of Service and embed policies and decide whether to ask channel owners for permission.
- Some YouTube titles contain marketing words such as "fat burn" or "calories". Brain Training uses brain-and-body coordination classes (walking with memory and coordination tasks, a 15-minute brain and body class, a 1-hour neuroplasticity workout); no finger-gymnastics class that states 10 or 45 minutes in its title was found. LifeZoi shows the title exactly as the channel wrote it and makes no such claim itself.

## Videos in the collection

82 of 84 lengths have a video (96 videos including alternatives).

| Activity | Length | Video (YouTube) | Instructor / channel | Level |
| --- | --- | --- | --- | --- |
| Pilates | 10 min | [10 Minute Pilates Workout for Beginners](https://www.youtube.com/watch?v=ebq5vPWvvOc) | Jessica Valant | beginner |
| Pilates | 15 min | [15 min Pilates Workout for Beginners (no equipment)](https://www.youtube.com/watch?v=aPe4HDT9trQ) | Trifecta Pilates | beginner |
| Pilates | 20 min | [20 MIN PILATES WORKOUT FOR BEGINNERS // FULL BODY](https://www.youtube.com/watch?v=x6tJflfdW9E) | IsaWelly Pilates | beginner |
| Pilates | 20 min (alt.) | [20 MIN BEGINNER'S PILATES WORKOUT / FULL-BODY / NO EQUIPMENT](https://www.youtube.com/watch?v=xU3vDlJPrs4) | IsaWelly Pilates | beginner |
| Pilates | 30 min | [30 MIN FULL BODY WORKOUT // At-Home Beginner Pilates (No Equipment)](https://www.youtube.com/watch?v=2mkR5LPhOC4) | Move With Nicole | beginner |
| Pilates | 45 min | [45-Min Live Pilates Class / Full Body Flow (Beginner Friendly, No Props)](https://www.youtube.com/watch?v=ckmmIr9Wp-8) | WE ARE AL!VE | beginner |
| Pilates | 60 min | [60 Min Full Body Pilates Workout / No Equipment / Burn Fat, Sculpt & Tone](https://www.youtube.com/watch?v=bwkJ-Yr4hTE) | Keel Pilates | intermediate |
| Yoga | 10 min | [10 minute Yoga for NECK & SHOULDER Tension Relief (all standing, no mat needed)](https://www.youtube.com/watch?v=RUS50iYq8-8) | SarahBethYoga | gentle |
| Yoga | 15 min | [15 min Evening Yoga Stretch - NO PROPS Bedtime Yoga Stretches](https://www.youtube.com/watch?v=2xJ2Iip2SR0) | Yoga with Kassandra | gentle |
| Yoga | 20 min | [Yoga For Complete Beginners - 20 Minute Home Yoga Workout!](https://www.youtube.com/watch?v=v7AYKMP6rOE) | Yoga With Adriene | beginner |
| Yoga | 30 min | [Hatha Flow Yoga For Beginners (30-min) Discover the Hatha Yoga Style (All Levels) Full Class](https://www.youtube.com/watch?v=GWg-siH2VEA) | BrettLarkinYoga | beginner |
| Yoga | 45 min | [Chair Yoga for Seniors / 45 Minute Stretch & Balance / Standing & Seated Exercises Only](https://www.youtube.com/watch?v=vJKt86ayWxk) | Paradigm Yoga | gentle |
| Yoga | 60 min | [60-minute Basic Yoga](https://www.youtube.com/watch?v=TsVdAhENb_0) | Kaitlyn D'Onofrio | beginner |
| Aerobics | 10 min | [10 MIN AEROBICS CARDIO Workout / Low Impact, No Equipment, No Jumping / All Standing](https://www.youtube.com/watch?v=62HkZd0y5sg) | Natalia Siejka | beginner |
| Aerobics | 10 min (alt.) | [10 Min Low Impact Cardio Workout for Beginners - Low Impact Workout & Aerobic Exercises](https://www.youtube.com/watch?v=bcutDeOt5nk) | HASfit | beginner |
| Aerobics | 15 min | [15 MIN CARDIO AEROBICS - Move To The Beat (All Standing, Low Impact)](https://www.youtube.com/watch?v=Uci74Cq5Q9A) | MadFit | beginner |
| Aerobics | 20 min | [Low Impact Aerobics Walking Workout for Beginners & Seniors // 20 minutes 2500 steps!](https://www.youtube.com/watch?v=Zq8_bscMqac) | SeniorShape Fitness | gentle |
| Aerobics | 30 min | [30 min CARDIO AEROBICS WORKOUT ♫ / No Jumping / No Squats / Challenge Your Coordination](https://www.youtube.com/watch?v=oFON1wxbdjw) | fitbymik | intermediate |
| Aerobics | 45 min | [45 Minute Low Impact Cardio Workout / High or Low Impact Aerobics at Home](https://www.youtube.com/watch?v=lL_tbxw_-z8) | CHRISTINA DORNER | intermediate |
| Aerobics | 60 min | [60 MIN LOW IMPACT CARDIO WORKOUT / All Standing, No Equipment](https://www.youtube.com/watch?v=Yfmhx6UEC-Q) | Courtney Holland - Any Weight Fitness | intermediate |
| Dance Fitness | 10 min | [10 MINUTE DANCE WORKOUT / Full Body - No Equipment / (Cardio Workout at Home)](https://www.youtube.com/watch?v=bqVBMv_nqJ4) | DanceFit | beginner |
| Dance Fitness | 10 min (alt.) | [Fun 10 Minute Dance Cardio Workout! / No equipment needed! / Fitness at home](https://www.youtube.com/watch?v=89dm6fCSqKs) | Bizzy Boom | intermediate |
| Dance Fitness | 15 min | [15 Minute- Senior/Low Impact Dance Fitness](https://www.youtube.com/watch?v=fBqoipuEOAU) | Erin Blackburn Fitness | gentle |
| Dance Fitness | 20 min | [20-min DANCE WORKOUT for Active Seniors and Beginners](https://www.youtube.com/watch?v=DrlPz5p_xnc) | Improved Health | gentle |
| Dance Fitness | 30 min | [30 Minute Zumba Gold® Dance Workout #25 / Active Older Adults and Beginners Class I We Keep Moving](https://www.youtube.com/watch?v=c4qRyt6pFdY) | We Keep Moving | gentle |
| Dance Fitness | 45 min | [45 Minute Zumba Gold® Class / Home Dance Workout #33 / Low-Impact / Over 50 Fitness I We Keep Moving](https://www.youtube.com/watch?v=CMMXByyv-Yw) | We Keep Moving | gentle |
| Dance Fitness | 60 min | [1-Hour Full Body Dance Fitness Workout!](https://www.youtube.com/watch?v=0xlBHBBFSik) | Oula | intermediate |
| Dance Fitness | 60 min (alt.) | [1 Hour Non Stop Dance Fitness With AJ / Burn Upto 800 Calories 🔥](https://www.youtube.com/watch?v=zQZit8vKt6Y) | AJ DanceFit | advanced |
| Home Cardio | 10 min | [10-Minute No-Equipment, At-Home Cardio Workout](https://www.youtube.com/watch?v=gUWFmn8f3H4) | PS Fit | intermediate |
| Home Cardio | 15 min | [15 MIN BEGINNER CARDIO Workout (At Home No Equipment)](https://www.youtube.com/watch?v=xVc3nSKWg74) | MadFit | beginner |
| Home Cardio | 15 min (alt.) | [15 MIN CARDIO WORKOUT FOR BEGINNERS (At Home No Equipment)](https://www.youtube.com/watch?v=7AlXsljuzGM) | Fitness Forever | beginner |
| Home Cardio | 20 min | [20 Minute CARDIO WORKOUT at Home / Low Impact, No Repeat, No Equipment](https://www.youtube.com/watch?v=06FUs7cW-7Y) | The Tori Method | beginner |
| Home Cardio | 20 min (alt.) | [20 Min BEGINNER CARDIO Workout For Fat Burn (No Equipment, At Home)](https://www.youtube.com/watch?v=vnBXaCsoEPU) | Oliver Sjostrom | beginner |
| Home Cardio | 20 min (alt.) | [20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, Home Workout](https://www.youtube.com/watch?v=yXHgcYpUVD4) | Nobadaddiction | advanced |
| Home Cardio | 30 min | [30-Minute Cardio Workout at Home / Fat-Burning, All Standing, No Equipment (Apartment Friendly!)](https://www.youtube.com/watch?v=pjn8OOC1b0Q) | Improved Health | beginner |
| Home Cardio | 30 min (alt.) | [30 MIN At Home Fat Burning Cardio Workout (Beginner to Advanced - No Equipment)](https://www.youtube.com/watch?v=WLZagztHccc) | KatieMFitness | intermediate |
| Home Cardio | 30 min (alt.) | [30 Minute HIIT CARDIO Workout // At Home (No Equipment)](https://www.youtube.com/watch?v=tYo0rWVEmYc) | Heather Robertson | advanced |
| Home Cardio | 45 min | [Over 5,000 Steps in 45 Minutes! / Low Impact Cardio Workout at Home](https://www.youtube.com/watch?v=0djMDrNIioI) | Improved Health | beginner |
| Home Cardio | 60 min | [60 MIN Low Impact HIIT Workout (No Jumping) 🔥 Beginner Friendly Cardio At Home](https://www.youtube.com/watch?v=CGzRzkqShmE) | Christian Cruz Fitness | intermediate |
| Strength Training | 10 min | [10-Minute Full Body Dumbbell Workout for Beginners](https://www.youtube.com/watch?v=x5y8jY6sKFQ) | Emily Daugherty | beginner |
| Strength Training | 15 min | [15 Minute Total Body Beginner Strength Training Workout- No Equipment, No Jumping](https://www.youtube.com/watch?v=J-_Xoj7HVfs) | SimplyFit by Lauren | beginner |
| Strength Training | 20 min | [20 Minute Bodyweight Strength Workout [FULL BODY // No Equipment]](https://www.youtube.com/watch?v=UjwKKl157hw) | Juice & Toya | intermediate |
| Strength Training | 20 min (alt.) | [20 min DUMBBELL STRENGTH WORKOUT / Full Body / No Repeats / Warm Up + Cool Down Included](https://www.youtube.com/watch?v=7j8vW0rVS4Q) | fitbymik | intermediate |
| Strength Training | 30 min | [30 min FULL BODY STRENGTH WORKOUT / With Dumbbells (And Without) / No Repeats](https://www.youtube.com/watch?v=36BuhRO3zng) | fitbymik | intermediate |
| Strength Training | 45 min | [45 MIN FULL BODY STRENGTH Workout With Weights (Warm Up & Cool Down Included)](https://www.youtube.com/watch?v=W6wwO_gbn-o) | MadFit | intermediate |
| Strength Training | 45 min (alt.) | [45-Minute Full Body Bodyweight Workout (No Equipment) / Follow Along](https://www.youtube.com/watch?v=UXVW4ka97SU) | Gritty Soldier | advanced |
| Strength Training | 60 min | [60 Minute Full Body Dumbbell Workout [Strength Training]](https://www.youtube.com/watch?v=UAw3YLDLMHo) | Juice & Toya | advanced |
| Chair Exercises | 10 min | [10-Minute Chair Workout for Seniors (All Seated, No Equipment)](https://www.youtube.com/watch?v=6KiPatdnGEY) | Move Well After 60 | gentle |
| Chair Exercises | 15 min | [15 minutes Gentle Chair Exercises for Seniors / No Equipment](https://www.youtube.com/watch?v=rdihR3giOw4) | Improved Health | gentle |
| Chair Exercises | 20 min | [20-Min Seated Exercise Routine for Seniors 60+ / Full Body Chair Workout](https://www.youtube.com/watch?v=yPm8tm61RNQ) | Cerebromotion | gentle |
| Chair Exercises | 30 min | [AT HOME Chair Exercises for SENIORS or BEGINNERS / 30 minutes (no equipment needed)](https://www.youtube.com/watch?v=slBsNXH4GW8) | Improved Health | beginner |
| Chair Exercises | 45 min | [45-Min Chair Workout for Seniors / Cardio, Strength & Stretch](https://www.youtube.com/watch?v=sbZzR-L2Tw4) | Improved Health Chair Workouts | beginner |
| Chair Exercises | 45 min (alt.) | [45 Minute Chair Exercises for Seniors to BOOST Cardio, Strength, Balance & Flexibility](https://www.youtube.com/watch?v=VwVpEQVl39g) | Improved Health Chair Workouts | beginner |
| Chair Exercises | 60 min | [60 Minute Chair Exercises for SENIORS / 💪 Full Body Home Workout](https://www.youtube.com/watch?v=V22m8fN3mmo) | Improved Health Chair Workouts | beginner |
| Stretching | 10 min | [10 Min Full Body Stretch Routine for Beginners](https://www.youtube.com/watch?v=t_YEUWe6Yn8) | Jeffrey Peng MD | beginner |
| Stretching | 15 min | [15 Min Full Body Stretch for Stiffness & Flexibility / Gentle Mobility Routine](https://www.youtube.com/watch?v=oY2jk_a3k9U) | Dr. Melissa Oleson | gentle |
| Stretching | 20 min | [20 Min. Full Body Stretch / Deep Stretching Routine to Level Up Your Flexibility / at Home](https://www.youtube.com/watch?v=u1M0wQ07COk) | Fitness Train 7 | intermediate |
| Stretching | 30 min | [30 Min Beginner Full Body Stretch / Gentle & Easy Routine](https://www.youtube.com/watch?v=puw9Oviv0fA) | Bendy Body | gentle |
| Stretching | 45 min | [45 Minute Full Body Stretch Routine / Follow Along, No Talking, No Music](https://www.youtube.com/watch?v=9Xo0U1NRK7k) | EDR Fitness | intermediate |
| Stretching | 60 min | [60 Minute Full Body Active Flexibility Routine (FOLLOW ALONG) *500k Subscriber Special*](https://www.youtube.com/watch?v=aUm3qE2dvB8) | Tom Merrick | advanced |
| Tai Chi | 10 min | [10 Min Daily Tai Chi Routine for Beginners (Follow Along)](https://www.youtube.com/watch?v=aLRRYm6W4uw) | Begin with Breath Tai Chi / Dr. Adam Potts, PT | beginner |
| Tai Chi | 15 min | [15-Minute Morning Tai Chi for a New You - Increase Mobility](https://www.youtube.com/watch?v=6igZbhM3I_w) | Begin with Breath Tai Chi / Dr. Adam Potts, PT | beginner |
| Tai Chi | 20 min | [20 Min Daily Tai Chi Routine for Beginners (Follow Along)](https://www.youtube.com/watch?v=fARe1_Wxi-U) | Begin with Breath Tai Chi / Dr. Adam Potts, PT | beginner |
| Tai Chi | 30 min | [30 Mins Tai Chi for Seniors, Beginners, Over 60+ - Improve Strength, Balance & Calm #taichi](https://www.youtube.com/watch?v=aYA3ANh2ghc) | Freshfield Fitness TAI CHI ACTIVE | gentle |
| Tai Chi | 45 min | [45 Min "Tai Chi for Balance and Strength](https://www.youtube.com/watch?v=-6sM9_FSKqY) | Emory Goizueta Brain Health Institute | gentle |
| Tai Chi | 60 min | [EASY 1Hour Tai Chi Fitness for SENIORS at Home!](https://www.youtube.com/watch?v=ZjUhhYq_M6E) | Enjoy Taichi Workout | gentle |
| Qigong | 10 min | [10 Minute Qigong Routine to Start Your Day - Qigong for Beginners](https://www.youtube.com/watch?v=nLnT25Q9tSU) | Qigong with Kseny | beginner |
| Qigong | 15 min | [Shaolin Qigong 15 Minute Daily Routine](https://www.youtube.com/watch?v=y2RAEnWreoE) | Qigong Meditation | beginner |
| Qigong | 20 min | [20 Minute Morning Qi Gong Exercise by Lee Holden](https://www.youtube.com/watch?v=pj4qo2KL9f4) | Tyler Trahan | beginner |
| Qigong | 30 min | [Qigong 30 minutes daily routine for beginners](https://www.youtube.com/watch?v=SkZRRmzO3h0) | Martin Ratté | beginner |
| Qigong | 45 min | [Qigong, Tai Chi, & Meditation: Four Elements (45 mins) / Dana-Farber Zakim Center Remote Programming](https://www.youtube.com/watch?v=4sKhEpZEWQA) | Dana-Farber Cancer Institute | gentle |
| Qigong | 60 min | [Qigong Exercises with David J Coon FREE 60 Minute Qigong Class](https://www.youtube.com/watch?v=1YHB38bQVVY) | Qigong Awareness LLC | beginner |
| Balance Training | 10 min | [10 Minute Balance Exercises for Seniors / Over 50 Fall Prevention Workout](https://www.youtube.com/watch?v=1AaAWRvKj1k) | Improved Health | gentle |
| Balance Training | 15 min | [Standing Balance Exercises - 15 Minute Balance Workout At Home!](https://www.youtube.com/watch?v=y0kLu8_csmQ) | Jessica Valant | beginner |
| Balance Training | 15 min (alt.) | [Seniors: Daily 15 minute  Workout for  Balance.](https://www.youtube.com/watch?v=MfJX0Dcz74k) | Balance Builders by Doug Weiss | gentle |
| Balance Training | 20 min | [Seniors: 20-Minute Complete Balance Workout](https://www.youtube.com/watch?v=57eeOuZydWM) | Balance Builders by Doug Weiss | gentle |
| Balance Training | 30 min | [Seniors: Regain Your Balance/ 30 Minute Class](https://www.youtube.com/watch?v=thzxbC49EKw) | Balance Builders by Doug Weiss | gentle |
| Balance Training | 45 min | [Ageless Balance Senior Exercise: 45-Minute Seated Stretches & Standing Mobility & Balance Exercises](https://www.youtube.com/watch?v=-aGlOqj6ttU) | Ageless Balance / Balance & Fall Prevention | gentle |
| Balance Training | 60 min | [60-minute Senior Fitness Dynamic Balance & Cardio Workout to Prevent Falls & Improve Mobility](https://www.youtube.com/watch?v=r7TaElp-sLo) | Ageless Balance / Balance & Fall Prevention | intermediate |
| Breathing & Relaxation | 10 min | [Guided Breathing Exercise: 10 Minutes](https://www.youtube.com/watch?v=R5GbeubY558) | GILD Coaching | beginner |
| Breathing & Relaxation | 15 min | [Deep Breathing Meditation ~ 15 Minute Meditation for Stress](https://www.youtube.com/watch?v=D_cx80_wQ8k) | Meditation Mountain | beginner |
| Breathing & Relaxation | 20 min | [Relaxation Practice: Breathing - 20 min](https://www.youtube.com/watch?v=twWFwCW4Z08) | LEAP Service | beginner |
| Breathing & Relaxation | 30 min | [30 Min Conscious Breathing Meditation / Access Your Higher Guidance](https://www.youtube.com/watch?v=zaeQvUZySxM) | Kris Kelly | beginner |
| Breathing & Relaxation | 45 min | [Yoga Nidra 45 minutes Guided Meditation](https://www.youtube.com/watch?v=5mnG_R_KtXQ) | Mindfulness Movement Yoga | gentle |
| Breathing & Relaxation | 60 min | [60 Minute Parasympathetic Breathwork -  By Sandy](https://www.youtube.com/watch?v=w7TzSTnf8z8) | The Holistic Tapes | beginner |
| Brain Training | 15 min | [15 Min Brain + Body Workout for Seniors](https://www.youtube.com/watch?v=kpfI17sEdj8) | Yes2Next | gentle |
| Brain Training | 20 min | [20 Minute Walking Workout That Burns Fat Like CRAZY + Brain Boost 🔥](https://www.youtube.com/watch?v=p8S0QFWzMG8) | fabulous50s | beginner |
| Brain Training | 30 min | [30 Minute Fat Burning Walking Workout + Brain Training Foe Women Over 50!](https://www.youtube.com/watch?v=7t6ZMca6WM8) | fabulous50s | beginner |
| Brain Training | 60 min | [The 1-Hour Neuroplasticity Workout to Rewire Focus, Processing & Memory](https://www.youtube.com/watch?v=RCfoMT7HCC4) | Kris Safarova | beginner |
| Meditation | 10 min | [Just Breathe ~ A 10 Minute Guided Meditation](https://www.youtube.com/watch?v=y6iTjoN407U) | Great Meditation | beginner |
| Meditation | 15 min | [15 Minute Guided Meditation for Deep Relaxation / Calm Voice for Sleep & Stress Relief](https://www.youtube.com/watch?v=rj1sr3ospPI) | Lofi is everything | beginner |
| Meditation | 15 min (alt.) | [15 Minute Guided Meditation / Strength & Grounding In Stressful Times](https://www.youtube.com/watch?v=z0GtmPnqAd8) | Boho Beautiful Yoga | beginner |
| Meditation | 20 min | [20 Minute Guided Meditation for Focused Attention and Concentration (No Music, Voice Only)](https://www.youtube.com/watch?v=kuMOkcUD4xA) | Declutter The Mind | beginner |
| Meditation | 30 min | [30 Minute Guided Meditation - The Silent Mind](https://www.youtube.com/watch?v=6-iJU06UugA) | OnlineMeditation | beginner |
| Meditation | 45 min | [45 Minute Guided Mindfulness Meditation (Voice Only, No Music)](https://www.youtube.com/watch?v=f7pKql-ZUSg) | Declutter The Mind | beginner |
| Meditation | 60 min | [60-Minute Mindfulness Meditation / Calm Your Mind & Body](https://www.youtube.com/watch?v=zKAdUQHdMZU) | Auralin | beginner |

## Missing lengths

These lengths show "Not available yet". No embeddable video that states this length in its title was found. Finger gymnastics and brain-training videos rarely say their length in the title. Add one with `npm run video:add -- <URL> --library brain-training` when found.

- Brain Training 10 min
- Brain Training 45 min
