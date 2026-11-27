import { msg } from "@/lib/i18n/translate";
import { sources } from "@/lib/sources";
import { lessonById } from "@/lib/wellness/movement-studio/catalog";

/**
 * Health tips: short public articles in the lifeZoi voice.
 *
 * Rules for every article (docs/claude-migration/HEALTH_TIPS.md):
 * - general wellness education only: no diagnosis, no treatment, no medication advice;
 * - no invented figures, percentages, or risk reductions; a number appears only when the
 *   linked public source states it;
 * - every article cites at least one source from `src/lib/sources.ts`;
 * - English is the source text; Ukrainian, Russian, and Greek are in catalog/<locale>/blog.json.
 */

export type SourceId = keyof typeof sources;

export type BlogSection = { heading: string; paragraphs: string[] };

/** A short video shown by link. The title and publisher stay in the original language. */
export type BlogVideo = { link: string; title: string; publisher: string; note: string };

export type BlogArticle = {
  slug: string;
  topic: string;
  title: string;
  summary: string;
  /** ISO date the article was written or last checked. */
  published: string;
  readMinutes: number;
  sections: BlogSection[];
  tryThis: string[];
  sourceIds: SourceId[];
  video?: BlogVideo;
};

const NIA = "National Institute on Aging";

/** A National Institute on Aging film that the Movement Studio already verified. */
function niaFilm(lessonId: string, note: string): BlogVideo {
  const lesson = lessonById(lessonId);
  if (!lesson || lesson.kind !== "video") throw new Error(`Unknown video lesson ${lessonId}`);
  return { link: `https://www.youtube.com/watch?v=${lesson.youtubeId}`, title: lesson.title, publisher: NIA, note };
}

export const BLOG_TOPICS = {
  movement: msg("Movement"),
  sleep: msg("Sleep"),
  food: msg("Food and drink"),
  mind: msg("Stress and mood"),
  connection: msg("Connection"),
  outdoors: msg("Outdoors"),
} as const;

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "small-walks-add-up",
    topic: BLOG_TOPICS.movement,
    title: msg("Small walks add up"),
    summary: msg("You do not need a gym or a long workout to move more. Short walks across the day count, and they are easy to repeat."),
    published: "2026-11-25",
    readMinutes: 3,
    sections: [
      {
        heading: msg("Why short walks count"),
        paragraphs: [
          msg("The World Health Organization says that any amount of physical activity is better than none. For adults it describes at least 150 minutes of moderate-intensity activity a week. Short walks spread across the day are one way to build towards that."),
          msg("A ten-minute walk after a meal, a walk to the shop instead of the car, or a few laps of the corridor during a phone call all belong to the same week."),
        ],
      },
      {
        heading: msg("Make it easy to repeat"),
        paragraphs: [
          msg("A habit lasts longer when it is tied to something you already do. Pick one moment, such as after breakfast or after work, and walk then. Keep comfortable shoes near the door."),
          msg("Walk at a pace where you can still talk. If you have a heart, lung, or joint condition, or you have not been active for a while, ask your clinician what kind of activity suits you."),
        ],
      },
    ],
    tryThis: [
      msg("Choose one daily moment for a 10-minute walk this week."),
      msg("Take the stairs for one floor, or park a little further away."),
      msg("Stand up and walk around during one phone call a day."),
    ],
    sourceIds: ["whoActivity", "usActivityGuidelines"],
  },
  {
    slug: "a-calmer-evening-for-sleep",
    topic: BLOG_TOPICS.sleep,
    title: msg("A calmer evening for better sleep"),
    summary: msg("Sleep often starts long before bedtime. A steady routine and a quieter last hour can make it easier to rest."),
    published: "2026-11-25",
    readMinutes: 3,
    sections: [
      {
        heading: msg("How much sleep adults need"),
        paragraphs: [
          msg("The National Heart, Lung, and Blood Institute says experts recommend 7 to 9 hours of sleep a night for most adults. Needs differ from person to person, and how rested you feel matters too."),
          msg("Going to bed and waking up at about the same time each day, including weekends, helps many people keep a steady rhythm."),
        ],
      },
      {
        heading: msg("The last hour before bed"),
        paragraphs: [
          msg("Bright screens, work email, and heavy meals late in the evening keep many people alert. Try dimming lights, putting the phone in another room, and choosing something calm, such as reading or gentle stretching."),
          msg("If you often feel very tired during the day, snore loudly, or lie awake most nights, talk with a clinician. Ongoing sleep problems are worth checking."),
        ],
      },
    ],
    tryThis: [
      msg("Pick a wake-up time and keep it for seven days."),
      msg("Set a reminder one hour before bed to start winding down."),
      msg("Keep the bedroom cool, dark, and quiet."),
    ],
    sourceIds: ["nhlbiSleep"],
  },
  {
    slug: "water-through-the-day",
    topic: BLOG_TOPICS.food,
    title: msg("Water through the day"),
    summary: msg("Water is the simplest drink there is. A few small cues can help you reach for it more often than sugary drinks."),
    published: "2026-11-25",
    readMinutes: 2,
    sections: [
      {
        heading: msg("Why water is a good default"),
        paragraphs: [
          msg("Nutrition.gov explains that water helps the body work as it should, and that needs change with heat, activity, and health. Water has no added sugar and no calories."),
          msg("The CDC’s Rethink Your Drink page notes that sugary drinks such as soda, sweet tea, and energy drinks can add a lot of sugar to a day. Swapping some of them for water is a simple change."),
        ],
      },
      {
        heading: msg("Small cues that help"),
        paragraphs: [
          msg("Keep a glass or bottle where you can see it: on the desk, by the sink, or in your bag. Drink a glass with each meal."),
          msg("If plain water feels dull, add slices of lemon, cucumber, or mint. If a clinician has asked you to limit fluids, follow that advice."),
        ],
      },
    ],
    tryThis: [
      msg("Start the morning with a glass of water."),
      msg("Swap one sugary drink a day for water or unsweetened tea."),
      msg("Carry a refillable bottle when you go out."),
    ],
    sourceIds: ["nutritionWater", "cdcRethinkDrink"],
  },
  {
    slug: "add-one-plant-to-your-plate",
    topic: BLOG_TOPICS.food,
    title: msg("Add one plant to your plate"),
    summary: msg("Instead of cutting foods out, try adding one: a vegetable, a fruit, beans, or whole grains. It is a gentle way to get more fiber."),
    published: "2026-11-25",
    readMinutes: 3,
    sections: [
      {
        heading: msg("Adding is easier than removing"),
        paragraphs: [
          msg("Many people find it easier to add something good than to give up a favourite food. The Dietary Guidelines for Americans encourage vegetables, fruits, whole grains, and beans as part of everyday eating."),
          msg("MedlinePlus describes fiber as the part of plant foods the body does not digest, found in fruits, vegetables, whole grains, beans, nuts, and seeds."),
        ],
      },
      {
        heading: msg("Go slowly"),
        paragraphs: [
          msg("MedlinePlus suggests adding fiber gradually and drinking enough water, since a sudden large change can cause gas or bloating."),
          msg("If you have a digestive condition or a special diet from your clinician, ask before making big changes."),
        ],
      },
    ],
    tryThis: [
      msg("Add a handful of vegetables to one meal a day."),
      msg("Choose whole-grain bread or oats once this week."),
      msg("Put a bowl of fruit where you can see it."),
    ],
    sourceIds: ["dietaryGuidelines", "medlineplusFiber"],
  },
  {
    slug: "two-minutes-for-stress",
    topic: BLOG_TOPICS.mind,
    title: msg("Two minutes for stress"),
    summary: msg("Stress is part of life, but small pauses can help you notice it and respond more calmly. Here are a few simple ideas."),
    published: "2026-11-25",
    readMinutes: 3,
    sections: [
      {
        heading: msg("Noticing stress"),
        paragraphs: [
          msg("The National Institute of Mental Health describes stress as how the brain and body respond to a demand. Short-term stress can be useful, but stress that lasts a long time can affect sleep, mood, and health."),
          msg("A first step is simply noticing it: tight shoulders, a fast heartbeat, short temper, or trouble sleeping."),
        ],
      },
      {
        heading: msg("A short pause"),
        paragraphs: [
          msg("NIMH lists regular activity, relaxing activities, setting priorities, and staying connected with people as ways to cope. Slow breathing is one relaxing activity you can do anywhere: breathe in gently through the nose, then breathe out a little longer than you breathed in, for about two minutes."),
          msg("If stress feels overwhelming, lasts for weeks, or you have thoughts of harming yourself, reach out for help. In the United States you can call or text 988."),
        ],
      },
    ],
    tryThis: [
      msg("Set one reminder a day to pause and take five slow breaths."),
      msg("Write down the three things that matter most today."),
      msg("Take a short walk outside when you feel tense."),
    ],
    sourceIds: ["nimhStress", "samhsa988"],
  },
  {
    slug: "why-staying-in-touch-matters",
    topic: BLOG_TOPICS.connection,
    title: msg("Why staying in touch matters"),
    summary: msg("Feeling connected to other people is part of wellbeing. Small, regular contact can mean a lot, for you and for them."),
    published: "2026-11-25",
    readMinutes: 2,
    sections: [
      {
        heading: msg("Connection is part of health"),
        paragraphs: [
          msg("The World Health Organization describes social isolation and loneliness as serious concerns for health and wellbeing at every age, not only for older people."),
          msg("Being alone is not always lonely, and being with people does not always feel connected. What counts is having relationships that feel supportive."),
        ],
      },
      {
        heading: msg("Small ways to reach out"),
        paragraphs: [
          msg("A short message, a call while you walk, or a regular coffee with a neighbour are all ways to stay in touch. Clubs, classes, and volunteering bring people together around something shared."),
          msg("If you feel lonely most of the time, it is worth telling someone you trust or a clinician. You do not have to sort it out on your own."),
        ],
      },
    ],
    tryThis: [
      msg("Send one message today to someone you have not spoken to in a while."),
      msg("Plan one regular call or meeting each week."),
      msg("Look for one local group or class that interests you."),
    ],
    sourceIds: ["whoConnection"],
  },
  {
    slug: "rethinking-the-evening-drink",
    topic: BLOG_TOPICS.food,
    title: msg("Rethinking the evening drink"),
    summary: msg("If an evening drink has become automatic, a few alcohol-free evenings a week can be an easy experiment."),
    published: "2026-11-25",
    readMinutes: 3,
    sections: [
      {
        heading: msg("What the guidance says"),
        paragraphs: [
          msg("The National Institute on Alcohol Abuse and Alcoholism explains that alcohol affects many parts of the body, including the brain, heart, and liver, and that drinking less is better for health than drinking more."),
          msg("Alcohol can also make sleep lighter later in the night, even when it helps people fall asleep at first."),
        ],
      },
      {
        heading: msg("Try a swap"),
        paragraphs: [
          msg("Keep a drink you enjoy ready for the moment you would usually pour alcohol: sparkling water with fruit, herbal tea, or an alcohol-free option. Notice how you sleep and feel the next morning."),
          msg("Do not stop suddenly on your own if you drink heavily every day, because that can be dangerous. Talk with a clinician first. If you take medicines, ask whether alcohol is safe with them."),
        ],
      },
    ],
    tryThis: [
      msg("Choose two alcohol-free evenings this week."),
      msg("Keep sparkling water or herbal tea ready for the evening."),
      msg("Write down how you slept on alcohol-free nights."),
    ],
    sourceIds: ["niaaa", "cdcRethinkDrink"],
  },
  {
    slug: "sun-sense-for-outdoor-walks",
    topic: BLOG_TOPICS.outdoors,
    title: msg("Sun sense for outdoor walks"),
    summary: msg("Time outdoors is a pleasure. A little sun planning lets you enjoy walks and gardening while protecting your skin."),
    published: "2026-11-25",
    readMinutes: 2,
    sections: [
      {
        heading: msg("Enjoy the outdoors, protect your skin"),
        paragraphs: [
          msg("The CDC’s sun safety guidance recommends shade, clothing that covers the arms and legs, a wide-brimmed hat, sunglasses, and broad-spectrum sunscreen of SPF 15 or higher."),
          msg("Skin can burn on cloudy days and in winter too, especially near snow or water."),
        ],
      },
      {
        heading: msg("Plan the walk"),
        paragraphs: [
          msg("On bright days, walk earlier or later, choose shady paths, and take water with you. Reapply sunscreen when the label says to, and after swimming or sweating."),
          msg("If you notice a new spot or a mole that changes, ask a clinician to look at it."),
        ],
      },
    ],
    tryThis: [
      msg("Keep a hat and sunscreen by the door with your walking shoes."),
      msg("Choose a shady route for midday walks."),
      msg("Check the label of your sunscreen for broad-spectrum protection."),
    ],
    sourceIds: ["cdcSunSafety", "whoActivity"],
  },
  {
    slug: "strength-and-balance-at-any-age",
    topic: BLOG_TOPICS.movement,
    title: msg("Strength and balance at any age"),
    summary: msg("Muscle-strengthening and balance activities help with everyday tasks such as carrying shopping and climbing stairs. Simple ones can be done at home."),
    published: "2026-11-25",
    readMinutes: 3,
    sections: [
      {
        heading: msg("Why strength and balance matter"),
        paragraphs: [
          msg("The Physical Activity Guidelines for Americans include muscle-strengthening activities on two or more days a week for adults. For older adults they also include balance training."),
          msg("Strength and balance support the things people want to keep doing: getting up from a chair, carrying bags, gardening, and walking with confidence."),
        ],
      },
      {
        heading: msg("Start simple and safe"),
        paragraphs: [
          msg("Wall push-ups, standing up from a chair a few times, and holding a counter while you balance are gentle places to start. The short film below from the National Institute on Aging shows one balance exercise."),
          msg("Keep a sturdy chair or counter within reach. Stop if you feel pain, dizziness, or chest discomfort, and ask a clinician which exercises suit you if you have a health condition or a history of falls."),
        ],
      },
    ],
    tryThis: [
      msg("Stand up from a chair slowly five times, using your hands if you need to."),
      msg("Do a few wall push-ups while the kettle boils."),
      msg("Hold a counter and practise standing on one foot for a few seconds."),
    ],
    sourceIds: ["usActivityGuidelines", "whoActivity"],
    video: niaFilm("video-balance", msg("A one-minute balance exercise from the National Institute on Aging. Keep a sturdy support within reach.")),
  },
];

/** Short videos on the Health tips page, shown by link from their own channels. */
export const BLOG_VIDEOS: BlogVideo[] = [
  niaFilm("video-balance", msg("A one-minute balance exercise. Keep a sturdy chair or counter within reach.")),
  niaFilm("video-wall", msg("Push-ups against a wall to work the arms and shoulders while standing.")),
  niaFilm("video-shoulder", msg("A short shoulder and arm stretch. Sit or stand, whichever is steadier for you.")),
  niaFilm("video-hands", msg("A short seated hand grip exercise with a small ball. Good for a quick break.")),
];

export function articleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

/** Plain text for search engines and the share card. */
export function articlePlainText(article: BlogArticle): string {
  return [article.summary, ...article.sections.flatMap((section) => [section.heading, ...section.paragraphs])].join(" ");
}
