/**
 * Short reads written for LifeZoi. Original text, so they can be read and listened
 * to inside the app. Each page is a list of paragraphs.
 */

export type Book = {
  id: string;
  title: string;
  kind: "story" | "guide";
  summary: string;
  credit: string;
  pages: string[][];
};

const CREDIT = "Written for LifeZoi. Original text.";

export const BOOKS: Book[] = [
  {
    id: "walk-around-the-block",
    title: "A Walk Around the Block",
    kind: "story",
    summary: "Margaret decides to take one short walk each morning, and the street turns out to be fuller than she thought.",
    credit: CREDIT,
    pages: [
      [
        "Margaret had lived on Linden Street for thirty-one years, and for most of them she had seen it through a car window. She knew the pharmacy, the post office, and the shape of the corner where the bus turned. She did not know the street.",
        "On a Tuesday in early spring she put on her soft shoes, found her keys, and stood at the front door for longer than she meant to. One walk around the block, she told herself. If it was dull, she would never do it again.",
      ],
      [
        "The first thing she noticed was the sound. Without the engine, the street had birds in it, and a radio somewhere playing an old song she half remembered. A man was sweeping the step of the bakery and nodded at her as if they had met before.",
        "At the corner she stopped to catch her breath and pretended to read a notice about a lost cat. Nobody seemed to mind that she was slow. A young mother with a pushchair went past at nearly the same pace.",
      ],
      [
        "By the third corner her legs felt warm and a little heavy, which was not unpleasant. She found she was counting the gardens: one with tulips, one with a broken gnome, one with a lemon tree in a pot that someone clearly loved very much.",
        "When she reached her own door again, eleven minutes had passed. It was not a long time. It was enough to notice that she wanted to know whether the lemon tree would fruit.",
      ],
      [
        "She walked again on Wednesday, and on Friday, and missed Thursday because of the rain, and did not scold herself about it. By the end of the month the man at the bakery knew her name, and she knew that his was Tomas.",
        "Margaret never became a person who walked for hours. She became a person who walked around the block, and sometimes twice. It turned out that was a perfectly good kind of person to be.",
      ],
    ],
  },
  {
    id: "window-garden",
    title: "The Kitchen Window Garden",
    kind: "guide",
    summary: "Growing a few herbs on a windowsill: what to choose, how to water, and why it is satisfying.",
    credit: CREDIT,
    pages: [
      [
        "A windowsill garden asks very little. A bright window, a few small pots with holes in the bottom, a saucer under each one, and some ordinary potting compost are enough to begin.",
        "Good first herbs are the forgiving ones. Mint, chives, parsley, and basil grow well indoors. Mint spreads eagerly, so give it a pot of its own. Basil likes warmth and dislikes cold glass in winter.",
      ],
      [
        "Most indoor herbs are lost to too much water rather than too little. Push a fingertip into the soil. If it feels damp, wait. If it feels dry at the depth of your first knuckle, water until a little runs into the saucer, then empty the saucer after a few minutes.",
        "Turn the pots a quarter turn every few days so the plants do not lean towards the light. Pinch off the top leaves of basil and mint regularly. It feels unkind, but it makes the plant bushier.",
      ],
      [
        "Part of the pleasure is the daily look. Many people find that checking on a plant becomes a small, calm habit, a reason to stand by the window for a minute in the morning.",
        "When the herbs grow, use them. A few chopped chives on eggs, a sprig of mint in hot water, or torn basil on tomatoes adds flavour without needing extra salt. If you have a plant allergy, choose herbs you already know are safe for you.",
      ],
    ],
  },
  {
    id: "gentle-days",
    title: "Small Habits, Gentle Days",
    kind: "guide",
    summary: "A short, kind look at building habits that last, without perfection or guilt.",
    credit: CREDIT,
    pages: [
      [
        "Most lasting changes start smaller than people expect. Not a new life on Monday, but one glass of water before breakfast, two minutes of stretching after brushing your teeth, or a walk to the end of the road and back.",
        "Small steps work partly because they are easy to repeat on a hard day. A habit you can do when you are tired, busy, or low is a habit that has a chance to stay.",
      ],
      [
        "It helps to attach a new habit to something you already do. After I pour my morning tea, I will sit by the window and take five slow breaths. The tea becomes a reminder that does not need an alarm.",
        "Making the habit visible helps too. Leave the walking shoes by the door, the book on the chair, the fruit bowl where you can see it. The easiest choice is often the one in front of us.",
      ],
      [
        "You will miss days. Everyone does. A missed day is information, not failure. Was the habit too big? Was the time wrong? Many people find it useful to aim for never missing twice in a row, rather than never missing at all.",
        "Notice what you enjoy, and do more of that. A habit that feels like a small pleasure lasts longer than one that feels like a punishment. Be as patient with yourself as you would be with a good friend.",
      ],
    ],
  },
  {
    id: "lighthouse-morning",
    title: "The Lighthouse Keeper's Morning",
    kind: "story",
    summary: "An old lighthouse keeper's quiet routine at dawn, told slowly. Good for winding down.",
    credit: CREDIT,
    pages: [
      [
        "Before the sun came up, Elias climbed the hundred and twelve steps of the lighthouse, as he had done every morning for many years. He did not hurry. He counted the steps in tens and rested at each small window to look at the sea.",
        "At the top, the great lamp was still turning, sweeping its long arm of light across the grey water. He waited until the edge of the sky turned pale, and then he switched it off, and the room was suddenly very quiet.",
      ],
      [
        "He wiped the lens with a soft cloth, slowly, in circles, the way his father had shown him. There was no need to rush. The sea would be there all day, and so would he.",
        "Downstairs he made porridge with oats and a spoon of honey, and ate it by the window while the gulls argued on the rocks. A fishing boat went past, and someone on deck lifted a hand. Elias lifted his in return.",
      ],
      [
        "After breakfast he walked the short path around the island, past the patch of sea pinks and the bench where he liked to sit. The wind smelled of salt and seaweed. His knees complained a little on the slope, and he went more slowly there.",
        "When he came back, the sun was fully up and the water had turned from grey to blue. He wrote one line in his logbook, as he did every day: Calm morning. All well. Then he closed the book and sat for a while, listening.",
      ],
    ],
  },
  {
    id: "rest-and-sleep",
    title: "A Quiet Hour Before Sleep",
    kind: "guide",
    summary: "Gentle ideas for the last hour of the evening. General information, not treatment for a sleep problem.",
    credit: CREDIT,
    pages: [
      [
        "Many people sleep better when the last hour of the evening is a little slower than the rest of the day. Lowering the lights, putting the phone in another room, and choosing something calm to do can all help the body notice that night is coming.",
        "A regular time for going to bed and getting up, even at weekends, is one of the habits sleep experts most often suggest. The body likes a rhythm.",
      ],
      [
        "Some people like a warm, caffeine-free drink, a few pages of a gentle book, slow breathing, or soft music. Others prefer a short stretch or writing down tomorrow's worries so they can be set aside until the morning.",
        "If you lie awake for a long time, it can help to get up, sit somewhere dim and calm, and return to bed when you feel sleepy, rather than watching the clock.",
      ],
      [
        "If poor sleep goes on for weeks, or you snore loudly, stop breathing in your sleep, or feel very sleepy during the day, talk to a doctor or nurse. These can have causes that are worth checking.",
        "Tonight, choose one small thing to try. Notice how it feels. Sleep often improves gradually, and every calm evening counts.",
      ],
    ],
  },
];

export function bookById(id: string): Book | null {
  return BOOKS.find((book) => book.id === id) ?? null;
}

/** Roughly how long a page takes to read aloud, for listening estimates. */
export function pageWords(page: string[]): number {
  return page.join(" ").split(/\s+/).filter(Boolean).length;
}

export const PUBLIC_DOMAIN_LIBRARIES = [
  {
    name: "Project Gutenberg",
    url: "https://www.gutenberg.org/",
    note: "Free e-books whose U.S. copyright has expired. Check the copyright rules where you live.",
  },
  {
    name: "LibriVox",
    url: "https://librivox.org/",
    note: "Free public-domain audiobooks read by volunteers.",
  },
] as const;
