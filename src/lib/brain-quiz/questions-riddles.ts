import { choice, rebus, type ChoiceActivity, type RebusActivity } from "@/lib/brain-quiz/activities";

const c = choice;

const textRiddles: ChoiceActivity[] = [
  c("R01", "riddles", "easy", "Bigger when you take", "I grow larger the more you take away. What am I?", ["A hole", "A balloon", "A candle", "A shadow"], 0, [
    "Removing material from a hole makes the opening larger.",
    "A balloon grows when you add air, not when you take air away.",
    "A candle gets smaller as it burns.",
    "A shadow changes with light, but taking something away is not what makes it.",
  ]),
  c("R02", "riddles", "easy", "Keys without locks", "I have many keys and no locks. Musicians use me. What am I?", ["A piano", "A door", "A map", "A clock"], 0, [
    "Piano keys are played, and they do not open locks.",
    "A door is paired with a lock, which this riddle leaves out.",
    "A map has no musical keys.",
    "A clock has hands, not a keyboard of keys.",
  ]),
  c("R03", "riddles", "easy", "Face and hands", "I have a face and hands, and I tell you when to start the day. What am I?", ["A clock", "A person", "A coin", "A book"], 0, [
    "A clock face and clock hands mark the time.",
    "A person has a face and hands, but the waking clue points to a timepiece.",
    "A coin can have a face and has no hands.",
    "A book has no hands that point to an hour.",
  ]),
  c("R04", "riddles", "easy", "Stairs", "I go up and down, and I stay in one place. What am I?", ["Stairs", "A river", "A bird", "An elevator car"], 0, [
    "Stairs let people go up and down while the steps stay put.",
    "A river moves along its course.",
    "A bird leaves its perch.",
    "An elevator car travels between floors.",
  ]),
  c("R05", "riddles", "easy", "Teeth that do not bite", "I have teeth and I do not bite. I help tidy hair. What am I?", ["A comb", "A saw", "A zipper", "A rake"], 0, [
    "A comb’s teeth pass through hair.",
    "A saw has teeth and cuts, which is a kind of bite.",
    "A zipper has no row of teeth used on hair.",
    "A rake has tines and is for leaves, not hair.",
  ]),
  c("R06", "riddles", "medium", "Full of holes", "I am full of holes and I can hold water. What am I?", ["A sponge", "A bucket", "A window", "A net"], 0, [
    "A sponge is porous and soaks up water.",
    "A bucket holds water because it is not full of holes.",
    "A window does not hold a drink of water.",
    "A net lets water run through.",
  ]),
  c("R07", "riddles", "medium", "Yours, used by others", "What belongs to you and is used more often by other people?", ["Your name", "Your shoes", "Your pillow", "Your toothbrush"], 0, [
    "Other people say your name when they talk to you or about you.",
    "Other people do not usually wear your shoes.",
    "A pillow is mostly used by the person who sleeps on it.",
    "A toothbrush is personal and not meant to be shared.",
  ]),
  c("R08", "riddles", "medium", "Cities, no houses", "I show cities and have no houses you can enter. What am I?", ["A map", "A town", "A postcard", "A street"], 0, [
    "A map draws cities without containing real houses.",
    "A town has houses people can enter.",
    "A postcard is a picture, and the riddle’s clue is a chart of places.",
    "A street is a place in a city, not a picture of many cities.",
  ]),
  c("R09", "riddles", "medium", "Letter T", "What word starts with T, ends with T, and has tea in it?", ["Teapot", "Tent", "Toast", "Ticket"], 0, [
    "Teapot begins and ends with T, and it is made to hold tea.",
    "Tent begins and ends with T, but it does not hold tea.",
    "Toast begins with T and ends with T, and it is food rather than a pot of tea.",
    "Ticket ends with T and does not start with T.",
  ]),
  c("R10", "riddles", "medium", "Runs, never walks", "I run and I never walk. Boats travel on me. What am I?", ["A river", "A clock", "A shoe", "A road"], 0, [
    "A river is said to run, and boats travel on it.",
    "A clock runs as a figure of speech and does not carry boats.",
    "A shoe is for walking.",
    "A road is walked and driven on, and boats do not travel on it.",
  ]),
  c("R11", "riddles", "hard", "Daytime follower", "I follow you in daylight and I am gone in a dark room. What am I?", ["A shadow", "A friend", "An echo", "A coat"], 0, [
    "A shadow needs light, so it disappears when the room is dark.",
    "A friend does not vanish because a light is off.",
    "An echo depends on sound, not daylight.",
    "A coat stays with you in the dark.",
  ]),
  c("R12", "riddles", "hard", "One eye", "I have one eye and I cannot see. I pull thread. What am I?", ["A needle", "A camera", "A fish", "A button"], 0, [
    "A needle’s eye is the hole that carries thread.",
    "A camera can have a lens called an eye and does not pull thread.",
    "A fish has an eye that is part of a living animal, and the riddle’s eye cannot see.",
    "A button has holes and does not have one eye for thread in this sense.",
  ]),
  c("R13", "riddles", "hard", "Wetter while drying", "I get wetter the more I dry. What am I?", ["A towel", "A cloud", "A paintbrush", "A sponge left in the sun"], 0, [
    "A towel picks up water while it dries a surface.",
    "A cloud is not used to dry something.",
    "A paintbrush gets wetter when it is dipped, not when it dries.",
    "A sponge in the sun gets drier.",
  ]),
  c("R14", "riddles", "hard", "Hard to hold", "I am light, and even a strong person cannot hold me for long. What am I?", ["A breath", "A feather", "A secret", "A balloon string"], 0, [
    "You can hold a breath only for a short time.",
    "A feather is easy to hold.",
    "A secret can be kept for years.",
    "A balloon string can be held as long as the person wishes.",
  ]),
];

const pictureRiddles: RebusActivity[] = [
  rebus("B01", "easy", "Head over heels", { arrangement: "stack", pieces: [{ type: "text", text: "HEAD", scale: "lg" }, { type: "text", text: "HEELS", scale: "md" }] }, ["Head over heels", "Heels over head", "Head to head", "Two left feet"], 0, [
    "HEAD is drawn above HEELS, which reads as head over heels.",
    "The heels are underneath, not on top.",
    "The same word is not repeated.",
    "No feet are drawn, and the words are not about a left side.",
  ]),
  rebus("B02", "easy", "I understand", { arrangement: "stack", pieces: [{ type: "text", text: "STAND", scale: "lg" }, { type: "text", text: "I", scale: "md" }] }, ["I understand", "Stand by me", "I stand alone", "Understand I"], 0, [
    "The letter I sits under STAND, which reads as I understand.",
    "The picture has no second person to stand beside.",
    "I is under the word, not standing alone beside it.",
    "The order in the phrase puts I first.",
  ]),
  rebus("B03", "easy", "Reading between the lines", { arrangement: "between", text: "READING" }, ["Reading between the lines", "Read the headline", "Underline the word", "Reading upside down"], 0, [
    "The word sits between two drawn lines.",
    "There is no headline, only two lines and one word.",
    "The lines are around the word, not a single underline.",
    "The word is upright.",
  ]),
  rebus("B04", "easy", "Tricycle", { arrangement: "repeat", text: "CYCLE", count: 3 }, ["Tricycle", "Bicycle", "Recycle", "Motorcycle"], 0, [
    "Three cycles side by side read as tricycle.",
    "A bicycle would show two.",
    "Nothing in the picture says the cycles are being reused.",
    "A motorcycle is one machine, not three cycles.",
  ]),
  rebus("B05", "easy", "Think big", { arrangement: "stack", pieces: [{ type: "text", text: "THINK", scale: "lg" }] }, ["Think big", "Small thought", "Think twice", "Big think tank"], 0, [
    "The word THINK is drawn large, so the phrase is think big.",
    "The lettering is large, not small.",
    "The word appears once.",
    "No tank or group is drawn.",
  ]),
  rebus("B06", "medium", "Side by side", { arrangement: "row", pieces: [{ type: "text", text: "SIDE", scale: "md" }, { type: "text", text: "SIDE", scale: "md" }] }, ["Side by side", "Inside", "Aside", "Sideways glance"], 0, [
    "The two words sit next to each other.",
    "Neither word is inside the other.",
    "Aside would move a word off to the margin.",
    "The words are level, not turned into a glance.",
  ]),
  rebus("B07", "medium", "Eye candy", { arrangement: "row", pieces: [{ type: "icon", icon: "eye" }, { type: "text", text: "CANDY", scale: "md" }] }, ["Eye candy", "Candy eye", "Sweet tooth", "Private eye"], 0, [
    "An eye icon is placed beside the word candy.",
    "The eye comes first in the picture’s reading order.",
    "No tooth is drawn.",
    "The eye is not labeled as a detective.",
  ]),
  rebus("B08", "medium", "Sunflower", { arrangement: "row", pieces: [{ type: "icon", icon: "sun" }, { type: "text", text: "FLOWER", scale: "md" }] }, ["Sunflower", "Flower power", "Sunny day", "Moonflower"], 0, [
    "The sun icon and the word flower combine into sunflower.",
    "No second word says power.",
    "The word flower is part of the answer, not only the sun.",
    "The icon is a sun, not a moon.",
  ]),
  rebus("B09", "medium", "Moonlight", { arrangement: "row", pieces: [{ type: "icon", icon: "moon" }, { type: "text", text: "LIGHT", scale: "md" }] }, ["Moonlight", "Light moon", "Daylight", "Starlight"], 0, [
    "The moon icon comes before the word light.",
    "Reading the word first would reverse the picture.",
    "The icon is a moon, not a sun.",
    "No star is drawn.",
  ]),
  rebus("B10", "medium", "Rainbow", { arrangement: "row", pieces: [{ type: "icon", icon: "rain" }, { type: "text", text: "BOW", scale: "md" }] }, ["Rainbow", "Bow rain", "Raincoat", "Elbow"], 0, [
    "Rain plus bow reads as rainbow.",
    "The icon comes before the word.",
    "No coat is drawn.",
    "Elbow is a body word, and the picture shows rain.",
  ]),
  rebus("B11", "hard", "Bookworm", { arrangement: "row", pieces: [{ type: "icon", icon: "book" }, { type: "text", text: "WORM", scale: "md" }] }, ["Bookworm", "Worm book", "Bookmark", "Library"], 0, [
    "A book icon beside WORM reads as bookworm.",
    "The book comes first.",
    "The second part says worm, not mark.",
    "A library would need many books or a building.",
  ]),
  rebus("B12", "hard", "Starfish", { arrangement: "row", pieces: [{ type: "icon", icon: "star" }, { type: "text", text: "FISH", scale: "md" }] }, ["Starfish", "Fish star", "Starlight", "Goldfish"], 0, [
    "The star icon and the word fish make starfish.",
    "The star is drawn first.",
    "The word is fish, not light.",
    "Nothing in the picture says gold.",
  ]),
  rebus("B13", "hard", "Treehouse", { arrangement: "stack", pieces: [{ type: "icon", icon: "tree" }, { type: "text", text: "HOUSE", scale: "md" }] }, ["Treehouse", "Houseplant", "Family tree", "Greenhouse"], 0, [
    "The tree is drawn with HOUSE, which reads as treehouse.",
    "No plant pot is shown.",
    "No family names are written.",
    "The icon is a tree, not a glass house.",
  ]),
  rebus("B14", "hard", "Heartbeat", { arrangement: "row", pieces: [{ type: "icon", icon: "heart" }, { type: "text", text: "BEAT", scale: "md" }] }, ["Heartbeat", "Beat heart", "Hearty meal", "Drumbeat"], 0, [
    "The heart icon plus BEAT reads as heartbeat.",
    "The heart comes before the word.",
    "No meal is drawn.",
    "No drum is drawn.",
  ]),
  rebus("B15", "easy", "Handshake", { arrangement: "row", pieces: [{ type: "icon", icon: "hand" }, { type: "text", text: "SHAKE", scale: "md" }] }, ["Handshake", "Milkshake", "Shake a leg", "Handle"], 0, [
    "A hand icon beside SHAKE reads as handshake.",
    "No drink is drawn.",
    "No leg is drawn.",
    "The word is shake, not handle.",
  ]),
  rebus("B16", "medium", "Footnote", { arrangement: "stack", pieces: [{ type: "text", text: "NOTE", scale: "lg" }, { type: "icon", icon: "foot" }] }, ["Footnote", "Note to self", "Bigfoot", "Footstep"], 0, [
    "The foot is drawn under NOTE, which reads as footnote.",
    "There is no second note addressed to someone.",
    "The note is large and the foot is a separate icon, not a creature’s name.",
    "No steps or path are drawn.",
  ]),
  rebus("B17", "hard", "Time flies", { arrangement: "row", pieces: [{ type: "icon", icon: "clock" }, { type: "text", text: "FLIES", scale: "md" }] }, ["Time flies", "Fruit flies", "Clockwise", "Fly time"], 0, [
    "A clock stands in for time and sits beside the word flies.",
    "No fruit is drawn.",
    "Clockwise would turn the clock, and the word flies would be extra.",
    "The clock is read before the word.",
  ]),
  rebus("B18", "medium", "Top turned over", { arrangement: "flip", text: "TOP" }, ["Top turned over", "Stop", "Pot of gold", "Tip top"], 0, [
    "The word TOP is drawn upside down, so it has been turned over.",
    "No S is added to make stop.",
    "The letters are still TOP, even though they are flipped.",
    "The word is inverted, not stacked twice.",
  ]),
];

export const riddleQuestions: readonly (ChoiceActivity | RebusActivity)[] = [...textRiddles, ...pictureRiddles];
