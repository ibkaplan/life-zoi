import {
  choice,
  type AcrosticActivity,
  type ChoiceActivity,
  type CrosswordActivity,
  type LetterActivity,
  type WordSearchActivity,
} from "@/lib/brain-quiz/activities";

const c = choice;

const wordChoices: ChoiceActivity[] = [
  c("W01", "words", "easy", "Rearrange PEELS", "The letters PEELS rearrange into a word for night rest. Which word?", ["SLEEP", "SPELL", "APPLE", "PEACH"], 0, [
    "SLEEP uses P, E, E, L, and S.",
    "SPELL uses two L letters and only one E.",
    "APPLE needs an A and has only one E.",
    "PEACH needs an A, a C, and an H.",
  ]),
  c("W02", "words", "easy", "Anagram of TASTE", "Rearrange every letter in TASTE. Which word uses them once each?", ["STATE", "SEAT", "TEST", "TEA"], 0, [
    "STATE uses S, T, A, T, and E.",
    "SEAT leaves out a T.",
    "TEST leaves out the A and repeats letters differently.",
    "TEA uses only three of the letters.",
  ]),
  c("W03", "words", "easy", "Rearrange GIRDEB", "The letters GIRDEB spell which word?", ["BRIDGE", "BADGER", "BIGGER", "RIDGE"], 0, [
    "BRIDGE uses B, R, I, D, G, and E.",
    "BADGER uses an A, which is not in GIRDEB.",
    "BIGGER repeats G and has no D.",
    "RIDGE is missing the B.",
  ]),
  c("W04", "words", "medium", "Anagram of GARDEN", "Which word uses each letter in GARDEN once?", ["DANGER", "GRADE", "RANGE", "GREEN"], 0, [
    "DANGER uses D, A, N, G, E, and R.",
    "GRADE leaves out the N.",
    "RANGE leaves out the D.",
    "GREEN repeats E and has no D or A.",
  ]),
  c("W05", "words", "medium", "Rearrange KORW", "The letters KORW spell which word?", ["WORK", "WORD", "WALK", "WEAK"], 0, [
    "WORK uses W, O, R, and K.",
    "WORD uses a D, which is not in KORW.",
    "WALK uses A and L.",
    "WEAK uses E and A.",
  ]),
  c("W06", "words", "medium", "Rearrange PULM", "The letters PULM spell which word?", ["PLUM", "PLUMP", "PALM", "PULP"], 0, [
    "PLUM uses P, L, U, and M.",
    "PLUMP has an extra P.",
    "PALM uses an A, which is not in PULM.",
    "PULP uses a second P and has no M.",
  ]),
  c("W07", "words", "hard", "Rearrange TIFUR", "The letters TIFUR spell which word?", ["FRUIT", "FRUITY", "FAULT", "TRUFFLE"], 0, [
    "FRUIT uses F, R, U, I, and T.",
    "FRUITY has an extra Y.",
    "FAULT uses an A and has no R or I.",
    "TRUFFLE has extra letters, including a second F and an L.",
  ]),
  c("W08", "words", "hard", "Rearrange SGLAS", "The letters SGLAS spell which word?", ["GLASS", "GRASS", "CLASS", "GLOSS"], 0, [
    "GLASS uses G, L, A, S, and S.",
    "GRASS uses an R, which is not in SGLAS.",
    "CLASS uses a C, which is not in SGLAS.",
    "GLOSS uses an O, which is not in SGLAS.",
  ]),
  c("W09", "words", "easy", "Pillow, dream, alarm", "Which word names the idea shared by pillow, dream, and alarm?", ["Sleep", "Breakfast", "Running", "Music"], 0, [
    "A pillow, a dream, and an alarm all sit with sleep.",
    "Breakfast is a morning meal, not the shared idea of these three.",
    "Running is movement, and none of the three words is a sport.",
    "Music is not what these three words share.",
  ]),
  c("W10", "words", "easy", "Page, cover, chapter", "Which word names the thing that has a page, a cover, and a chapter?", ["Book", "Sandwich", "Window", "River"], 0, [
    "A book has pages, a cover, and chapters.",
    "A sandwich can have a cover of bread and has no chapters.",
    "A window has no chapters.",
    "A river has no pages.",
  ]),
  c("W11", "words", "medium", "Oak, shade, leaf", "Which word belongs with oak, shade, and leaf?", ["Tree", "Ocean", "Spoon", "Clock"], 0, [
    "An oak is a tree, and shade and a leaf belong with it.",
    "An ocean is water, not a tree.",
    "A spoon is a utensil.",
    "A clock tells time.",
  ]),
  c("W12", "words", "medium", "Plus, minus, equals", "Which word belongs with plus, minus, and equals?", ["Math", "Garden", "Pillow", "River"], 0, [
    "Plus, minus, and equals are math signs.",
    "A garden is a place for plants.",
    "A pillow is for rest.",
    "A river is water.",
  ]),
  c("W13", "words", "hard", "Needle, thread, button", "Which word belongs with needle, thread, and button?", ["Sewing", "Baking", "Swimming", "Painting"], 0, [
    "A needle, thread, and a button are sewing tools and notions.",
    "Baking uses bowls and ovens, not these three as a set.",
    "Swimming uses water.",
    "Painting uses pigment and a brush.",
  ]),
  c("W14", "words", "easy", "Finish the calm sentence", "Choose the word that completes the sentence: The room was quiet and ____.", ["calm", "ladder", "gravel", "trumpet"], 0, [
    "Calm agrees with quiet.",
    "A ladder is an object, not a way the room felt.",
    "Gravel is a material, not a match for quiet.",
    "A trumpet is loud, which fights the word quiet.",
  ]),
  c("W15", "words", "easy", "Finish the weather sentence", "Choose the word that completes the sentence: She opened the umbrella because it was ____.", ["raining", "sleeping", "square", "empty"], 0, [
    "An umbrella is opened in the rain.",
    "Sleeping does not explain an umbrella.",
    "Square is a shape, not weather.",
    "Empty does not explain an umbrella.",
  ]),
  c("W16", "words", "medium", "Finish the library sentence", "Choose the word that completes the sentence: He returned the book to the ____.", ["library", "ocean", "pocket watch", "melody"], 0, [
    "Books are returned to a library.",
    "An ocean is not where a borrowed book is returned.",
    "A pocket watch is not a place for a book.",
    "A melody is sound, not a place.",
  ]),
  c("W17", "words", "medium", "Finish the breakfast sentence", "Choose the word that completes the sentence: The toast was warm and ____.", ["buttered", "rectangular law", "underwater", "midnight"], 0, [
    "Butter is something people put on warm toast.",
    "A law is not a texture or topping for toast.",
    "Toast is not served underwater.",
    "Midnight is a time, not a way toast tastes.",
  ]),
  c("W18", "words", "hard", "Finish the path sentence", "Choose the word that completes the sentence: The hikers followed the narrow ____ through the trees.", ["trail", "spoon", "chorus", "invoice"], 0, [
    "A trail is a narrow way through trees.",
    "A spoon is not a path.",
    "A chorus is a group of singers.",
    "An invoice is a bill.",
  ]),
];

export const wordSearches: readonly WordSearchActivity[] = [
  {
    kind: "word-search",
    id: "WS1",
    category: "words",
    difficulty: "easy",
    title: "Rest and home search",
    prompt: "Find SLEEP, WATER, BOOK, and HOUSE. Tap the first letter and the last letter of each word.",
    rows: ["SLEEPX", "WATERY", "CATNAP", "BOOKSZ", "MAPLEQ", "HOUSED"],
    words: ["SLEEP", "WATER", "BOOK", "HOUSE"],
  },
  {
    kind: "word-search",
    id: "WS2",
    category: "words",
    difficulty: "medium",
    title: "Sky and weather search",
    prompt: "Find PLANET, RAINBOW, MOON, and EAGLE.",
    rows: ["PLANETS", "RAINBOW", "ICEBERG", "MOONLIT", "EAGLESX"],
    words: ["PLANET", "RAINBOW", "MOON", "EAGLE"],
  },
  {
    kind: "word-search",
    id: "WS3",
    category: "words",
    difficulty: "hard",
    title: "Long word search",
    prompt: "Find STARFISH, OCEAN, BRIDGE, CANDLE, and UNIVERSE.",
    rows: ["STARFISH", "COMPASSX", "LADDERSY", "OCEANBED", "UNIVERSE", "CANDLEZZ", "BRIDGEQQ", "FLOWERSQ"],
    words: ["STARFISH", "OCEAN", "BRIDGE", "CANDLE", "UNIVERSE"],
  },
];

export const letterFills: readonly LetterActivity[] = [
  {
    kind: "letters",
    id: "LF1",
    category: "words",
    difficulty: "easy",
    title: "Complete SLEEP",
    prompt: "Tap letters to fill the blanks. Extra letters are decoys.",
    pattern: "S_EE_",
    bank: ["L", "P", "A", "R", "M"],
    answer: "SLEEP",
  },
  {
    kind: "letters",
    id: "LF2",
    category: "words",
    difficulty: "medium",
    title: "Complete WATER",
    prompt: "Tap letters to fill the blanks.",
    pattern: "W_T_R",
    bank: ["A", "E", "L", "S", "O"],
    answer: "WATER",
  },
  {
    kind: "letters",
    id: "LF3",
    category: "words",
    difficulty: "hard",
    title: "Complete BALANCE",
    prompt: "Tap letters to fill the blanks in order.",
    pattern: "B_L_N_E",
    bank: ["A", "A", "C", "X", "T", "O"],
    answer: "BALANCE",
  },
];

export const acrostics: readonly AcrosticActivity[] = [
  {
    kind: "acrostic",
    id: "AC1",
    category: "words",
    difficulty: "easy",
    title: "Hidden first letters",
    prompt: "Tap the first letter of each word, in order. Together they spell a hidden word.",
    words: ["Share", "Lunch", "Every", "Evening", "Please"],
    answer: "SLEEP",
  },
  {
    kind: "acrostic",
    id: "AC2",
    category: "words",
    difficulty: "medium",
    title: "Another hidden word",
    prompt: "Tap the first letter of each word, in order.",
    words: ["Walk", "After", "Lunch", "Keep"],
    answer: "WALK",
  },
];

export const crosswords: readonly CrosswordActivity[] = [
  {
    kind: "crossword",
    id: "CW1",
    category: "words",
    difficulty: "medium",
    title: "Mini crossword",
    prompt: "Fill the white squares. Black squares stay blocked.",
    grid: ["HEART", "#A###", "#T###", "SLEEP", "#####"],
    numbers: { "0,0": 1, "0,1": 2, "3,0": 3 },
    clues: [
      { number: 1, dir: "across", text: "The organ that pumps blood (5)" },
      { number: 2, dir: "down", text: "To consume food (3)" },
      { number: 3, dir: "across", text: "Night rest (5)" },
    ],
  },
  {
    kind: "crossword",
    id: "CW2",
    category: "words",
    difficulty: "easy",
    title: "Water and walk",
    prompt: "Fill the white squares.",
    grid: ["WATER", "A####", "L####", "K####", "#####"],
    numbers: { "0,0": 1 },
    clues: [
      { number: 1, dir: "across", text: "A drink with no sugar added (5)" },
      { number: 1, dir: "down", text: "To travel on foot (4)" },
    ],
  },
];

export const wordQuestions = [...wordChoices, ...wordSearches, ...letterFills, ...acrostics, ...crosswords];
