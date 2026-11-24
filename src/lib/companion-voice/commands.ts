import { checkSafety } from "@/lib/mind/safety";
import type { CrisisKind } from "@/lib/emotional-wellness/types";
import type { LibraryCategory as MusicCategory } from "@/lib/music-library/catalog";
import { msg } from "@/lib/i18n/translate";

/**
 * The voice companion's local command system. It turns a spoken sentence into an
 * intent with simple word matching in English, Ukrainian, Russian, and Greek. It runs
 * in the browser, costs nothing, and sends nothing anywhere.
 */

export type GuidedKind = "pilates" | "yoga" | "meditation" | "breathing" | "stretching" | "mobility" | "relax";

export type PageKey =
  | "my-day"
  | "meals"
  | "sleep"
  | "quiz"
  | "progress"
  | "encyclopedia"
  | "dashboard"
  | "my-health"
  | "profile"
  | "nutrition"
  | "movement"
  | "music-page"
  | "lifezoi-ai"
  | "mind"
  | "settings"
  | "home";

export type GuidedTarget = { kind: "guided"; activity: GuidedKind; sessionId: string; fallback: string };

export type Intent =
  | { kind: "crisis"; kinds: CrisisKind[] }
  | { kind: "stop" }
  | { kind: "back" }
  | { kind: "yes" }
  | { kind: "no" }
  | { kind: "music"; category: MusicCategory | null }
  | { kind: "music-stop" }
  | GuidedTarget
  | { kind: "offer"; target: GuidedTarget }
  | { kind: "page"; page: PageKey }
  | { kind: "ask-ai"; question: string }
  | { kind: "greeting" }
  | { kind: "feeling"; mood: "good" | "low" }
  | { kind: "thanks" }
  | { kind: "help" }
  | { kind: "question"; text: string }
  | { kind: "unknown"; text: string };

/** Where each page command goes, and what LifeZoi says as it opens it. */
export const PAGES: Record<PageKey, { href: string; reply: string }> = {
  "my-day": { href: "/my-day", reply: msg("Of course! Let's open your My Day page.") },
  meals: { href: "/food-plan/today", reply: msg("Absolutely! Let's look at today's meal ideas.") },
  sleep: { href: "/library/topics/sleep", reply: msg("Here are LifeZoi's sleep and rest ideas.") },
  quiz: { href: "/brain-quiz", reply: msg("Let's open the Brain & Habit Quiz.") },
  progress: { href: "/progress", reply: msg("Here is your progress.") },
  encyclopedia: { href: "/encyclopedia", reply: msg("Opening the Health Encyclopedia.") },
  dashboard: { href: "/dashboard", reply: msg("Opening your dashboard.") },
  "my-health": { href: "/my-health", reply: msg("Opening My Health.") },
  profile: { href: "/assessment", reply: msg("Let's open your profile questionnaire.") },
  nutrition: { href: "/academy/meals", reply: msg("Opening Nutrition.") },
  movement: { href: "/academy/move/studio/daily-movement", reply: msg("Here are gentle movements for today. Chair yoga and stretching are good places to start.") },
  "music-page": { href: "/library/music", reply: msg("Opening My Music.") },
  "lifezoi-ai": { href: "/lifezoi-ai", reply: msg("Opening LifeZoi AI.") },
  mind: { href: "/mind", reply: msg("Opening LifeZoi Mind.") },
  settings: { href: "/settings#voice-companion", reply: msg("Opening your voice settings.") },
  home: { href: "/", reply: msg("Going back to the home page.") },
};

/** What LifeZoi says before a guided activity starts. */
export const GUIDED_REPLY: Record<GuidedKind, string> = {
  pilates: msg("Wonderful! Let's get started with Pilates."),
  yoga: msg("Lovely. Let's begin your yoga."),
  meditation: msg("Let's take a quiet moment. Your meditation is starting."),
  breathing: msg("Let's breathe together. Your breathing exercise is starting."),
  stretching: msg("Let's stretch gently."),
  mobility: msg("Let's loosen up your joints."),
  relax: msg("Let's relax together."),
};

/** What LifeZoi asks when a question points to a guided activity. */
export const GUIDED_OFFER: Record<GuidedKind, string> = {
  pilates: msg("A gentle Pilates session could be a good fit. Shall I start it?"),
  yoga: msg("Some gentle yoga could help. Shall I start it?"),
  meditation: msg("A short meditation could help. Shall I start one?"),
  breathing: msg("Slow breathing can help you settle. Shall I start a breathing exercise?"),
  stretching: msg("Some gentle stretching could help. Shall I start it?"),
  mobility: msg("Some easy joint movements could help. Shall I start them?"),
  relax: msg("Slow breathing and relaxing your muscles can help you wind down before sleep. Shall I start a relaxation session?"),
};

/** Existing pages to open when the guided-session player is not available. */
const GUIDED_FALLBACK: Record<GuidedKind, string> = {
  pilates: "/academy/move/library",
  yoga: "/academy/move/studio/chair-yoga",
  meditation: "/breathe",
  breathing: "/breathe",
  stretching: "/academy/move/studio/daily-movement",
  mobility: "/academy/move/studio/daily-movement",
  relax: "/breathe",
};

/** Lowercase, accents and punctuation removed, so "Медитацию!" and "медитацию" match the same stem. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function stems(list: readonly string[]): RegExp {
  const parts = list.map((item) => normalize(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(?:^| )(?:${parts.join("|")})`);
}

const W = {
  stopListening: stems(["stop listening", "stop", "be quiet", "quiet please", "pause listening", "microphone off", "mic off", "go to sleep lifezoi", "стоп", "хватит", "замолчи", "перестань", "не слушай", "выключи микрофон", "досить", "зупинись", "замовкни", "припини", "вимкни мікрофон", "σταματα", "στοπ", "σωπα", "κλεισε το μικροφωνο"]),
  back: stems(["go back", "back", "previous page", "назад", "вернись", "повернись", "πισω"]),
  musicStop: stems(["stop the music", "stop music", "pause the music", "pause music", "music off", "turn off the music", "выключи музыку", "останови музыку", "вимкни музику", "зупини музику", "σταματα τη μουσικη", "κλεισε τη μουσικη"]),
  music: stems(["music", "song", "songs", "tune", "музык", "песн", "музик", "пісн", "μουσικ", "τραγουδ"]),
  musicSleep: stems(["sleep", "bedtime", "сон", "сна", "спать", "сну", "спати", "υπν"]),
  musicNature: stems(["nature", "rain", "forest", "ocean", "природ", "дожд", "дощ", "φυσ", "βροχ"]),
  musicCalm: stems(["relax", "calm", "soft", "peaceful", "meditat", "спокой", "расслаб", "медитац", "спокі", "розслаб", "χαλαρ", "ηρεμ", "διαλογισ"]),
  musicMorning: stems(["morning", "energ", "утр", "бодр", "ранк", "ранков", "πρωιν"]),
  musicYoga: stems(["yoga", "йог", "γιογκα"]),
  musicClassical: stems(["classical", "piano", "классич", "класич", "фортепиан", "κλασικ", "πιανο"]),
  pilates: stems(["pilates", "пилатес", "пілатес", "πιλατες"]),
  meditation: stems(["meditat", "медитац", "διαλογισ"]),
  breathing: stems(["breath", "breathe", "дыхан", "дыши", "подыш", "дихан", "дихай", "подих", "αναπνο", "ανασ"]),
  yoga: stems(["yoga", "йог", "γιογκα", "γιοκα"]),
  stretching: stems(["stretch", "растяж", "потян", "розтяж", "потягн", "διατασ"]),
  mobility: stems(["mobility", "joints", "суставы", "суглоб", "αρθρωσ", "κινητικοτ"]),
  relax: stems(["relax", "unwind", "wind down", "расслаб", "розслаб", "χαλαρ"]),
  myDay: stems(["my day", "daily plan", "plan for today", "today's plan", "today plan", "my plan", "мой день", "план на сегодня", "мой план", "мій день", "план на сьогодні", "мій план", "η μερα μου", "τη μερα μου", "προγραμμα της ημερας", "σημεριν", "το προγραμμα μου"]),
  meals: stems(["breakfast", "lunch", "dinner", "meal", "eat", "food", "recipe", "cook", "завтрак", "обед", "ужин", "еда", "еду", "поесть", "покушать", "рецепт", "приготов", "сніданок", "сніданк", "обід", "вечеря", "вечерю", "їжа", "їжу", "поїсти", "приготу", "φαγητ", "γευμα", "μεσημεριαν", "βραδιν", "συνταγ", "να φαω", "τι να μαγειρεψω"]),
  sleep: stems(["sleep", "insomnia", "bedtime", "сон", "сна", "спать", "сну", "засып", "спати", "засина", "υπν", "αυπνι"]),
  quiz: stems(["quiz", "brain", "brain and habit", "викторин", "квиз", "мозг", "вікторин", "мозок", "κουιζ", "εγκεφαλ"]),
  progress: stems(["progress", "прогресс", "прогрес", "успех", "успіх", "προοδ"]),
  encyclopedia: stems(["encyclopedia", "encyclopaedia", "энциклопед", "енциклопед", "εγκυκλοπαιδ"]),
  dashboard: stems(["dashboard", "health dashboard", "панель", "дашборд", "πινακα"]),
  myHealth: stems(["my health", "мое здоровье", "моё здоровье", "моє здоров", "η υγεια μου", "την υγεια μου"]),
  profile: stems(["profile", "questionnaire", "assessment", "анкет", "профил", "профіл", "опитуван", "ερωτηματολογ", "προφιλ"]),
  nutrition: stems(["nutrition", "calorie", "калори", "питани", "харчуван", "θερμιδ", "διατροφ"]),
  movement: stems(["exercise", "workout", "movement", "упражнен", "зарядк", "тренир", "вправ", "тренуван", "ασκησ", "γυμναστικ", "κινηση"]),
  musicPage: stems(["my music", "моя музыка", "моя музика", "η μουσικη μου"]),
  ai: stems(["lifezoi ai", "life zoi ai", "ai assistant", "лайфзой ии", "ассистент", "асистент", "βοηθο"]),
  mind: stems(["lifezoi mind", "life zoi mind", "лайфзой майнд", "майнд"]),
  settings: stems(["settings", "voice settings", "настройк", "налаштуван", "ρυθμισ"]),
  home: stems(["home", "homepage", "home page", "main page", "start page", "главн", "домой", "домашн", "головн", "додому", "αρχικ"]),
  askAi: /^(?:ask lifezoi ai|ask lifezoi|ask ai|спроси лайфзой|спроси|спитай лайфзой|спитай|запитай|ρωτα το lifezoi|ρωτα)\s+(.+)$/,
  yes: stems(["yes", "yeah", "yep", "sure", "ok", "okay", "please do", "go ahead", "let's do it", "да", "конечно", "давай", "хорошо", "ладно", "так", "звісно", "звичайно", "добре", "ναι", "βεβαια", "εντα", "οκ"]),
  no: stems(["no", "nope", "not now", "no thanks", "нет", "не надо", "не сейчас", "ні", "не треба", "не зараз", "οχι", "οχι τωρα"]),
  greeting: stems(["good morning", "good afternoon", "good evening", "hello", "hi", "hey", "доброе утро", "добрый день", "добрый вечер", "привет", "здравствуй", "доброго ранку", "добрий день", "добрий вечір", "добрий вечер", "привіт", "вітаю", "καλημερα", "καλησπερα", "γεια"]),
  thanks: stems(["thank", "thanks", "спасибо", "благодар", "дякую", "ευχαριστ"]),
  help: stems(["help", "what can you do", "what can i say", "помоги", "помощь", "что ты умеешь", "что умеешь", "допоможи", "допомога", "що ти вмієш", "що вмієш", "βοηθει", "βοηθεια", "τι μπορεις"]),
  feelLow: stems(["tired", "exhausted", "stressed", "anxious", "worried", "sad", "not great", "not good", "bad", "lonely", "устал", "устала", "стресс", "тревож", "волну", "грустн", "плохо", "одинок", "втомил", "стрес", "тривож", "хвилю", "сумн", "погано", "самотн", "κουρασ", "αγχ", "στρες", "λυπ", "ασχημα", "μονος", "μονη"]),
  feelGood: stems(["good", "great", "fine", "well", "happy", "wonderful", "хорошо", "отлично", "нормально", "прекрасно", "замечательно", "добре", "чудово", "відмінно", "καλα", "τελεια", "υπεροχα"]),
  question: stems(["what", "how", "why", "when", "which", "should", "can you", "could you", "tell me", "is it", "are there", "do i", "что", "как", "почему", "зачем", "когда", "какой", "какие", "можно", "стоит ли", "расскажи", "що", "як", "чому", "коли", "який", "які", "чи", "розкажи", "τι", "πως", "γιατι", "ποτε", "ποιο", "ποια", "μπορεις", "πες μου"]),
};

const MINUTE_WORDS: Record<string, number> = {
  three: 3, five: 5, ten: 10, fifteen: 15, twenty: 20,
  три: 3, пять: 5, десять: 10, пятнадцать: 15, двадцать: 20, трех: 3, пяти: 5, десяти: 10, пятнадцати: 15, двадцати: 20,
  "п ять": 5, "п яти": 5, пятнадцять: 15, двадцять: 20,
  τρια: 3, πεντε: 5, δεκα: 10, δεκαπεντε: 15, εικοσι: 20,
};
const LENGTHS = [3, 5, 10, 15, 20] as const;

/** The meditation length asked for, rounded to the nearest length LifeZoi offers. Five minutes by default. */
export function minutesFrom(text: string): number {
  const folded = normalize(text);
  let asked: number | null = null;
  const digits = /(?:^| )(\d{1,2})(?= |$)/.exec(folded);
  if (digits) asked = Number(digits[1]);
  else {
    for (const [word, value] of Object.entries(MINUTE_WORDS)) {
      if (new RegExp(`(?:^| )${word}(?: |$)`).test(folded)) {
        asked = value;
        break;
      }
    }
  }
  if (asked === null || !Number.isFinite(asked) || asked <= 0) return 5;
  return LENGTHS.reduce((best, length) => (Math.abs(length - asked) < Math.abs(best - asked) ? length : best), 5 as number);
}

/** Morning, afternoon, or evening from the local hour. */
export function dayPart(hour: number): "morning" | "afternoon" | "evening" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

/** The guided-session id for an activity, following the guided-session catalog's ids. */
export function guidedSession(activity: GuidedKind, text: string, hour: number): string {
  const folded = normalize(text);
  const part = dayPart(hour);
  switch (activity) {
    case "pilates":
      return "pilates-gentle";
    case "yoga":
      return part === "morning" ? "yoga-morning" : "yoga-gentle";
    case "stretching":
      return "stretch-full-body";
    case "mobility":
      return "mobility-joints";
    case "breathing":
      return "breathing-calm";
    case "relax":
      return "relax-muscles";
    case "meditation": {
      const theme = W.musicSleep.test(folded)
        ? "sleep"
        : /(?:^| )(?:stress|стресс|стрес|στρες|αγχ)/.test(folded)
          ? "stress"
          : W.breathing.test(folded)
            ? "breathing"
            : /(?:^| )(?:mindful|осознан|усвідом|ενσυνειδητ)/.test(folded)
              ? "mindfulness"
              : part === "morning"
                ? "morning"
                : part === "evening"
                  ? "evening"
                  : "relaxation";
      return `meditation-${theme}-${minutesFrom(text)}`;
    }
  }
}

function guided(activity: GuidedKind, text: string, hour: number): GuidedTarget {
  return { kind: "guided", activity, sessionId: guidedSession(activity, text, hour), fallback: GUIDED_FALLBACK[activity] };
}

function musicCategory(folded: string): MusicCategory | null {
  if (W.musicSleep.test(folded)) return "sleep";
  if (W.musicNature.test(folded)) return "nature";
  if (W.musicCalm.test(folded)) return "meditation";
  if (W.musicMorning.test(folded)) return "morning";
  if (W.musicYoga.test(folded)) return "yoga";
  if (W.musicClassical.test(folded)) return "classical";
  return null;
}

function guidedKind(folded: string): GuidedKind | null {
  if (W.pilates.test(folded)) return "pilates";
  if (W.meditation.test(folded)) return "meditation";
  if (W.breathing.test(folded)) return "breathing";
  if (W.yoga.test(folded)) return "yoga";
  if (W.stretching.test(folded)) return "stretching";
  if (W.mobility.test(folded)) return "mobility";
  if (W.relax.test(folded)) return "relax";
  return null;
}

function pageKey(folded: string): PageKey | null {
  if (W.myDay.test(folded)) return "my-day";
  if (W.musicPage.test(folded)) return "music-page";
  if (W.meals.test(folded)) return "meals";
  if (W.sleep.test(folded)) return "sleep";
  if (W.quiz.test(folded)) return "quiz";
  if (W.progress.test(folded)) return "progress";
  if (W.encyclopedia.test(folded)) return "encyclopedia";
  if (W.dashboard.test(folded)) return "dashboard";
  if (W.myHealth.test(folded)) return "my-health";
  if (W.profile.test(folded)) return "profile";
  if (W.nutrition.test(folded)) return "nutrition";
  if (W.ai.test(folded)) return "lifezoi-ai";
  if (W.mind.test(folded)) return "mind";
  if (W.settings.test(folded)) return "settings";
  if (W.movement.test(folded)) return "movement";
  if (W.home.test(folded)) return "home";
  return null;
}

/** True when the sentence reads like a question rather than a command. */
export function isQuestion(text: string): boolean {
  return /\?\s*$/.test(text.trim()) || W.question.test(normalize(text).split(" ").slice(0, 3).join(" "));
}

/** Turns one spoken sentence into what LifeZoi should do. `hour` is the local hour, for morning or evening sessions. */
export function matchCommand(text: string, hour: number = new Date().getHours()): Intent {
  const raw = text.trim();
  const folded = normalize(raw);
  if (!folded) return { kind: "unknown", text: raw };

  const safety = checkSafety(raw);
  if (safety.level === "crisis") return { kind: "crisis", kinds: safety.kinds };

  const words = folded.split(" ");
  const short = words.length <= 3;
  if (short && W.no.test(folded) && !W.yes.test(folded.replace(/^(?:no|нет|ні|οχι) /, ""))) return { kind: "no" };
  if (short && W.yes.test(folded) && !W.no.test(folded)) return { kind: "yes" };

  if (W.musicStop.test(folded)) return { kind: "music-stop" };
  if (short && W.stopListening.test(folded)) return { kind: "stop" };
  if (/(?:stop listening|microphone off|mic off|выключи микрофон|не слушай|вимкни мікрофон|κλεισε το μικροφωνο)/.test(folded)) return { kind: "stop" };

  const ask = W.askAi.exec(folded);
  if (ask) return { kind: "ask-ai", question: raw.split(/\s+/).slice(folded.split(" ").length - ask[1].split(" ").length).join(" ") };

  if (W.music.test(folded) && !W.musicPage.test(folded)) return { kind: "music", category: musicCategory(folded) };

  const question = isQuestion(raw);
  const activity = guidedKind(folded);
  // "What should I eat for dinner to sleep well?" is about food, not a session.
  const page = pageKey(folded);
  if (activity && !(page === "meals")) {
    const target = guided(activity, raw, hour);
    return question ? { kind: "offer", target } : target;
  }
  if (page) return { kind: "page", page };

  if (short && W.back.test(folded)) return { kind: "back" };
  if (W.feelLow.test(folded)) return { kind: "feeling", mood: "low" };
  if (W.greeting.test(folded)) return { kind: "greeting" };
  if (W.thanks.test(folded)) return { kind: "thanks" };
  if (W.help.test(folded)) return { kind: "help" };
  if (W.feelGood.test(folded) && words.length <= 6) return { kind: "feeling", mood: "good" };
  if (question) return { kind: "question", text: raw };
  return { kind: "unknown", text: raw };
}
