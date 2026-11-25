import type { Locale } from "@/lib/i18n/config";

/**
 * The public "Meet LifeZoi" demo: a written, scripted conversation with the voice
 * companion, read aloud by the browser's own speech. Nothing here is a real person's
 * data, nothing is sent to an AI service, and the visitor's microphone is never used.
 * Every language has the same turns in the same order (checked by the unit test).
 */

export type DemoSpeaker = "zoi" | "you";

/** What the companion does on screen after a line, shown as a small chip. */
export type DemoAction = "welcome" | "breathing" | "my-day" | "music" | "read-aloud";

export type DemoTurn = { speaker: DemoSpeaker; text: string; action?: DemoAction };

export type DemoCopy = {
  pageTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  sampleNote: string;
  play: string;
  stop: string;
  replay: string;
  next: string;
  soundOn: string;
  soundOff: string;
  you: string;
  zoi: string;
  listening: string;
  speaking: string;
  ready: string;
  finished: string;
  progress: string;
  unsupported: string;
  noVoice: string;
  actions: Record<DemoAction, string>;
  featuresTitle: string;
  features: { title: string; text: string }[];
  privacyTitle: string;
  privacy: string[];
  joinTitle: string;
  joinText: string;
  haveInvitation: string;
  logIn: string;
  share: string;
  shared: string;
  shareText: string;
  turns: DemoTurn[];
};

/** The order of speakers and actions every language must follow. */
const SHAPE: { speaker: DemoSpeaker; action?: DemoAction }[] = [
  { speaker: "zoi", action: "welcome" },
  { speaker: "you" },
  { speaker: "zoi", action: "breathing" },
  { speaker: "you" },
  { speaker: "zoi" },
  { speaker: "you" },
  { speaker: "zoi", action: "my-day" },
  { speaker: "you" },
  { speaker: "zoi", action: "music" },
  { speaker: "you" },
  { speaker: "zoi", action: "read-aloud" },
];

function turns(lines: string[]): DemoTurn[] {
  if (lines.length !== SHAPE.length) throw new Error("Demo script has the wrong number of lines.");
  return SHAPE.map((shape, index) => ({ ...shape, text: lines[index] }));
}

const en: DemoCopy = {
  pageTitle: "Meet LifeZoi",
  metaDescription: "Hear a short sample conversation with the LifeZoi voice companion. No sign-up, no microphone, no AI service.",
  kicker: "Meet LifeZoi",
  title: "Hear the LifeZoi voice companion",
  lead: "Press Play for a two-minute sample conversation. LifeZoi greets you, guides a few calm breaths, reads out your day, and plays soft music, all by voice.",
  sampleNote: "Sample conversation. It is written in advance, your microphone is not used, and nothing is recorded.",
  play: "Play the demo",
  stop: "Stop",
  replay: "Play again",
  next: "Next line",
  soundOn: "Sound on",
  soundOff: "Captions only",
  you: "You",
  zoi: "LifeZoi",
  listening: "Listening…",
  speaking: "Speaking…",
  ready: "Ready when you are",
  finished: "That was LifeZoi.",
  progress: "Line {current} of {total}",
  unsupported: "This browser cannot read aloud, so the demo plays with captions only.",
  noVoice: "This device has no voice for this language, so the demo plays with captions only.",
  actions: {
    welcome: "Spoken welcome",
    breathing: "Opens guided breathing",
    "my-day": "Opens My Day",
    music: "Plays calm music",
    "read-aloud": "Listen on every page",
  },
  featuresTitle: "What the voice companion does for members",
  features: [
    { title: "A spoken welcome", text: "A short, friendly greeting for the time of day, with your first name once your profile is saved." },
    { title: "Voice commands in four languages", text: "Say “Open My Day”, “Start breathing” or “Play calm music” in English, Ukrainian, Russian or Greek." },
    { title: "Guided sessions", text: "Breathing, stretching, yoga and meditation, read step by step in a calm voice." },
    { title: "Listen to any page", text: "Every article and tip can be read aloud, at the speed you like." },
  ],
  privacyTitle: "About this demo",
  privacy: [
    "The conversation is a written script. It is the same for everyone.",
    "Your browser reads it with its own built-in voice. No text is sent to LifeZoi or to an AI service.",
    "LifeZoi is general wellness education. It is not medical advice.",
  ],
  joinTitle: "Would you like LifeZoi to talk with you?",
  joinText: "LifeZoi is for members, and joining is by invitation. If you have an invitation, you can create your account in a minute.",
  haveInvitation: "I have an invitation",
  logIn: "Log in",
  share: "Share this demo",
  shared: "Link copied",
  shareText: "Hear the LifeZoi voice companion in a two-minute demo.",
  turns: turns([
    "Good morning! I’m LifeZoi, your voice companion. Shall we plan a calm, healthy day together?",
    "I slept badly and I feel a little tense.",
    "Thank you for telling me. A few slow breaths can help you settle. Shall we try a short breathing exercise?",
    "Yes, start breathing.",
    "Let’s begin. Breathe in slowly through your nose… and breathe out gently, a little longer than you breathed in. Once more, nice and easy.",
    "What’s on my day today?",
    "In this sample plan: a short walk in the morning, water with lunch, and gentle stretching in the evening. Let’s keep today light.",
    "Play some calm music.",
    "Here is soft nature music. I’ll keep the volume low.",
    "Thank you, LifeZoi.",
    "You’re welcome. Tap the voice button whenever you want to talk again. I can also read any page aloud for you.",
  ]),
};

const uk: DemoCopy = {
  pageTitle: "Знайомтеся: LifeZoi",
  metaDescription: "Послухайте коротку зразкову розмову з голосовим помічником LifeZoi. Без реєстрації, без мікрофона, без ШІ-сервісу.",
  kicker: "Знайомтеся: LifeZoi",
  title: "Послухайте голосового помічника LifeZoi",
  lead: "Натисніть «Відтворити» — і за дві хвилини почуєте зразкову розмову. LifeZoi вітається, допомагає зробити кілька спокійних вдихів, розповідає про ваш день і вмикає тиху музику. Усе голосом.",
  sampleNote: "Це зразкова розмова. Її написано заздалегідь, ваш мікрофон не вмикається, нічого не записується.",
  play: "Відтворити демо",
  stop: "Зупинити",
  replay: "Відтворити ще раз",
  next: "Наступна репліка",
  soundOn: "Зі звуком",
  soundOff: "Лише субтитри",
  you: "Ви",
  zoi: "LifeZoi",
  listening: "Слухаю…",
  speaking: "Говорю…",
  ready: "Готові почати",
  finished: "Це був LifeZoi.",
  progress: "Репліка {current} з {total}",
  unsupported: "Цей браузер не вміє читати вголос, тому демо показується лише із субтитрами.",
  noVoice: "На цьому пристрої немає голосу для цієї мови, тому демо показується лише із субтитрами.",
  actions: {
    welcome: "Голосове вітання",
    breathing: "Відкриває дихальну вправу",
    "my-day": "Відкриває «Мій день»",
    music: "Вмикає спокійну музику",
    "read-aloud": "Прослуховування будь-якої сторінки",
  },
  featuresTitle: "Що голосовий помічник робить для учасників",
  features: [
    { title: "Голосове вітання", text: "Коротке привітне вітання відповідно до часу доби, з вашим ім’ям, коли профіль збережено." },
    { title: "Голосові команди чотирма мовами", text: "Скажіть «Відкрий мій день», «Почни дихання» або «Увімкни спокійну музику» українською, англійською, російською чи грецькою." },
    { title: "Сеанси з голосовим супроводом", text: "Дихання, розтяжка, йога й медитація — крок за кроком, спокійним голосом." },
    { title: "Прослуховування будь-якої сторінки", text: "Кожну статтю й пораду можна прослухати з потрібною швидкістю." },
  ],
  privacyTitle: "Про це демо",
  privacy: [
    "Розмова — це заздалегідь написаний сценарій. Він однаковий для всіх.",
    "Ваш браузер читає його власним вбудованим голосом. Жоден текст не надсилається ні до LifeZoi, ні до ШІ-сервісу.",
    "LifeZoi — це загальна просвіта про здоровий спосіб життя. Це не медична порада.",
  ],
  joinTitle: "Хочете, щоб LifeZoi говорив із вами?",
  joinText: "LifeZoi — для учасників, приєднатися можна за запрошенням. Якщо у вас є запрошення, обліковий запис можна створити за хвилину.",
  haveInvitation: "У мене є запрошення",
  logIn: "Увійти",
  share: "Поділитися демо",
  shared: "Посилання скопійовано",
  shareText: "Послухайте голосового помічника LifeZoi у двохвилинному демо.",
  turns: turns([
    "Доброго ранку! Я LifeZoi, ваш голосовий помічник. Сплануємо разом спокійний і корисний день?",
    "Мені погано спалося, і я відчуваю легке напруження.",
    "Дякую, що розповіли. Кілька повільних вдихів допоможуть заспокоїтися. Спробуємо коротку дихальну вправу?",
    "Так, почни дихання.",
    "Починаймо. Повільно вдихніть через ніс… і м’яко видихніть, трохи довше, ніж вдихали. Ще раз, легко й спокійно.",
    "Що в мене сьогодні в планах?",
    "У цьому зразковому плані: коротка прогулянка зранку, вода під час обіду та легка розтяжка ввечері. Нехай сьогодні буде легкий день.",
    "Увімкни спокійну музику.",
    "Ось тиха музика природи. Я залишу гучність невисокою.",
    "Дякую, LifeZoi.",
    "Будь ласка. Натисніть кнопку голосу, коли захочете поговорити знову. Я також можу прочитати вголос будь-яку сторінку.",
  ]),
};

const ru: DemoCopy = {
  pageTitle: "Знакомьтесь: LifeZoi",
  metaDescription: "Послушайте короткий пример разговора с голосовым помощником LifeZoi. Без регистрации, без микрофона, без ИИ-сервиса.",
  kicker: "Знакомьтесь: LifeZoi",
  title: "Послушайте голосового помощника LifeZoi",
  lead: "Нажмите «Воспроизвести» — и за две минуты услышите пример разговора. LifeZoi здоровается, помогает сделать несколько спокойных вдохов, рассказывает о вашем дне и включает тихую музыку. Всё голосом.",
  sampleNote: "Это пример разговора. Он написан заранее, ваш микрофон не включается, ничего не записывается.",
  play: "Воспроизвести демо",
  stop: "Остановить",
  replay: "Воспроизвести ещё раз",
  next: "Следующая реплика",
  soundOn: "Со звуком",
  soundOff: "Только субтитры",
  you: "Вы",
  zoi: "LifeZoi",
  listening: "Слушаю…",
  speaking: "Говорю…",
  ready: "Готовы начать",
  finished: "Это был LifeZoi.",
  progress: "Реплика {current} из {total}",
  unsupported: "Этот браузер не умеет читать вслух, поэтому демо показывается только с субтитрами.",
  noVoice: "На этом устройстве нет голоса для этого языка, поэтому демо показывается только с субтитрами.",
  actions: {
    welcome: "Голосовое приветствие",
    breathing: "Открывает дыхательное упражнение",
    "my-day": "Открывает «Мой день»",
    music: "Включает спокойную музыку",
    "read-aloud": "Прослушивание любой страницы",
  },
  featuresTitle: "Что голосовой помощник делает для участников",
  features: [
    { title: "Голосовое приветствие", text: "Короткое дружелюбное приветствие по времени суток, с вашим именем, когда профиль сохранён." },
    { title: "Голосовые команды на четырёх языках", text: "Скажите «Открой мой день», «Начни дыхание» или «Включи спокойную музыку» по-русски, по-английски, по-украински или по-гречески." },
    { title: "Занятия с голосовым сопровождением", text: "Дыхание, растяжка, йога и медитация — шаг за шагом, спокойным голосом." },
    { title: "Прослушивание любой страницы", text: "Каждую статью и совет можно прослушать с удобной скоростью." },
  ],
  privacyTitle: "Об этом демо",
  privacy: [
    "Разговор — это заранее написанный сценарий. Он одинаковый для всех.",
    "Ваш браузер читает его своим встроенным голосом. Никакой текст не отправляется ни в LifeZoi, ни в ИИ-сервис.",
    "LifeZoi — это общее просвещение о здоровом образе жизни. Это не медицинский совет.",
  ],
  joinTitle: "Хотите, чтобы LifeZoi разговаривал с вами?",
  joinText: "LifeZoi — для участников, присоединиться можно по приглашению. Если у вас есть приглашение, аккаунт можно создать за минуту.",
  haveInvitation: "У меня есть приглашение",
  logIn: "Войти",
  share: "Поделиться демо",
  shared: "Ссылка скопирована",
  shareText: "Послушайте голосового помощника LifeZoi в двухминутном демо.",
  turns: turns([
    "Доброе утро! Я LifeZoi, ваш голосовой помощник. Спланируем вместе спокойный и полезный день?",
    "Мне плохо спалось, и я чувствую лёгкое напряжение.",
    "Спасибо, что рассказали. Несколько медленных вдохов помогут успокоиться. Попробуем короткое дыхательное упражнение?",
    "Да, начни дыхание.",
    "Начинаем. Медленно вдохните через нос… и мягко выдохните, чуть дольше, чем вдыхали. Ещё раз, легко и спокойно.",
    "Что у меня сегодня в планах?",
    "В этом примерном плане: короткая прогулка утром, вода за обедом и лёгкая растяжка вечером. Пусть сегодня будет лёгкий день.",
    "Включи спокойную музыку.",
    "Вот тихая музыка природы. Я оставлю громкость невысокой.",
    "Спасибо, LifeZoi.",
    "Пожалуйста. Нажмите кнопку голоса, когда захотите поговорить снова. Я также могу прочитать вслух любую страницу.",
  ]),
};

const el: DemoCopy = {
  pageTitle: "Γνωρίστε το LifeZoi",
  metaDescription: "Ακούστε μια σύντομη ενδεικτική συζήτηση με τον φωνητικό βοηθό του LifeZoi. Χωρίς εγγραφή, χωρίς μικρόφωνο, χωρίς υπηρεσία AI.",
  kicker: "Γνωρίστε το LifeZoi",
  title: "Ακούστε τον φωνητικό βοηθό του LifeZoi",
  lead: "Πατήστε «Αναπαραγωγή» για μια ενδεικτική συζήτηση δύο λεπτών. Το LifeZoi σάς καλημερίζει, σας καθοδηγεί σε μερικές ήρεμες αναπνοές, σας λέει το πρόγραμμα της ημέρας και βάζει απαλή μουσική. Όλα με τη φωνή.",
  sampleNote: "Ενδεικτική συζήτηση. Είναι γραμμένη από πριν, το μικρόφωνό σας δεν χρησιμοποιείται και τίποτα δεν καταγράφεται.",
  play: "Αναπαραγωγή επίδειξης",
  stop: "Διακοπή",
  replay: "Ξανά από την αρχή",
  next: "Επόμενη φράση",
  soundOn: "Με ήχο",
  soundOff: "Μόνο υπότιτλοι",
  you: "Εσείς",
  zoi: "LifeZoi",
  listening: "Ακούω…",
  speaking: "Μιλάω…",
  ready: "Έτοιμο όποτε θέλετε",
  finished: "Αυτό ήταν το LifeZoi.",
  progress: "Φράση {current} από {total}",
  unsupported: "Αυτό το πρόγραμμα περιήγησης δεν μπορεί να διαβάσει φωναχτά, οπότε η επίδειξη παίζει μόνο με υπότιτλους.",
  noVoice: "Αυτή η συσκευή δεν έχει φωνή για αυτή τη γλώσσα, οπότε η επίδειξη παίζει μόνο με υπότιτλους.",
  actions: {
    welcome: "Φωνητικό καλωσόρισμα",
    breathing: "Ανοίγει καθοδηγούμενη αναπνοή",
    "my-day": "Ανοίγει το «Η μέρα μου»",
    music: "Βάζει ήρεμη μουσική",
    "read-aloud": "Ακρόαση κάθε σελίδας",
  },
  featuresTitle: "Τι κάνει ο φωνητικός βοηθός για τα μέλη",
  features: [
    { title: "Φωνητικό καλωσόρισμα", text: "Ένας σύντομος, φιλικός χαιρετισμός ανάλογα με την ώρα, με το όνομά σας όταν αποθηκευτεί το προφίλ σας." },
    { title: "Φωνητικές εντολές σε τέσσερις γλώσσες", text: "Πείτε «Άνοιξε τη μέρα μου», «Ξεκίνα αναπνοή» ή «Βάλε ήρεμη μουσική» στα ελληνικά, αγγλικά, ουκρανικά ή ρωσικά." },
    { title: "Καθοδηγούμενες συνεδρίες", text: "Αναπνοή, διατάσεις, γιόγκα και διαλογισμός, βήμα βήμα με ήρεμη φωνή." },
    { title: "Ακρόαση κάθε σελίδας", text: "Κάθε άρθρο και συμβουλή διαβάζεται φωναχτά, με την ταχύτητα που σας ταιριάζει." },
  ],
  privacyTitle: "Σχετικά με αυτή την επίδειξη",
  privacy: [
    "Η συζήτηση είναι ένα γραπτό σενάριο. Είναι ίδιο για όλους.",
    "Το πρόγραμμα περιήγησής σας το διαβάζει με τη δική του ενσωματωμένη φωνή. Κανένα κείμενο δεν στέλνεται στο LifeZoi ή σε υπηρεσία AI.",
    "Το LifeZoi προσφέρει γενική εκπαίδευση για την ευεξία. Δεν αποτελεί ιατρική συμβουλή.",
  ],
  joinTitle: "Θέλετε το LifeZoi να μιλάει μαζί σας;",
  joinText: "Το LifeZoi είναι για μέλη και η συμμετοχή γίνεται με πρόσκληση. Αν έχετε πρόσκληση, μπορείτε να δημιουργήσετε λογαριασμό σε ένα λεπτό.",
  haveInvitation: "Έχω πρόσκληση",
  logIn: "Σύνδεση",
  share: "Κοινοποίηση επίδειξης",
  shared: "Ο σύνδεσμος αντιγράφηκε",
  shareText: "Ακούστε τον φωνητικό βοηθό του LifeZoi σε μια επίδειξη δύο λεπτών.",
  turns: turns([
    "Καλημέρα! Είμαι το LifeZoi, ο φωνητικός σας βοηθός. Να σχεδιάσουμε μαζί μια ήρεμη, υγιεινή μέρα;",
    "Κοιμήθηκα άσχημα και νιώθω λίγο ένταση.",
    "Ευχαριστώ που μου το είπατε. Μερικές αργές αναπνοές βοηθούν να ηρεμήσετε. Να δοκιμάσουμε μια σύντομη άσκηση αναπνοής;",
    "Ναι, ξεκίνα αναπνοή.",
    "Ας ξεκινήσουμε. Εισπνεύστε αργά από τη μύτη… και εκπνεύστε απαλά, λίγο πιο αργά απ’ ό,τι εισπνεύσατε. Άλλη μία φορά, ήρεμα και άνετα.",
    "Τι έχω σήμερα στο πρόγραμμα;",
    "Σε αυτό το ενδεικτικό πρόγραμμα: μια σύντομη βόλτα το πρωί, νερό με το μεσημεριανό και απαλές διατάσεις το βράδυ. Ας κρατήσουμε τη μέρα ελαφριά.",
    "Βάλε ήρεμη μουσική.",
    "Ορίστε απαλή μουσική της φύσης. Θα κρατήσω την ένταση χαμηλά.",
    "Ευχαριστώ, LifeZoi.",
    "Παρακαλώ. Πατήστε το κουμπί φωνής όποτε θέλετε να μιλήσουμε ξανά. Μπορώ επίσης να διαβάσω φωναχτά οποιαδήποτε σελίδα.",
  ]),
};

export const MEET_DEMO: Record<Locale, DemoCopy> = { en, uk, ru, el };

/** Public address of the demo. */
export const MEET_DEMO_PATH = "/free/meet";

/**
 * How long a line stays on screen when it is not spoken (the visitor's lines, or
 * captions-only mode): long enough to read, never shorter than 1.8 seconds.
 */
export function captionMs(text: string): number {
  return Math.max(1800, Math.round(text.length * 55));
}

/** Fills `{current}` and `{total}`. */
export function progressLabel(copy: DemoCopy, current: number): string {
  return copy.progress.replace("{current}", String(current)).replace("{total}", String(copy.turns.length));
}
