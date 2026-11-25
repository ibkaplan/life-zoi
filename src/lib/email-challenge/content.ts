import type { Locale } from "@/lib/i18n/config";

/**
 * The 7-day LifeZoi challenge: one short, everyday task a day.
 *
 * The tasks are ordinary habits that the rest of LifeZoi already talks about
 * (water, walking, breathing, sleep, standing up, people, looking back). They
 * carry no numbers about health results, no promises, and no medical advice.
 * Every task can be skipped or made smaller.
 *
 * The text is kept here in all four languages, not in the page catalog, because
 * the server builds the emails too and has no browser catalog.
 */
export const CHALLENGE_LENGTH = 7;

export type DayText = { title: string; task: string; why: string };
export type ChallengeDay = { day: number } & Record<Locale, DayText>;

export const CHALLENGE_DAYS: readonly ChallengeDay[] = [
  {
    day: 1,
    en: {
      title: "A glass of water to start",
      task: "Before your first coffee or tea, drink one glass of water. Put the glass somewhere you will see it tonight, ready for tomorrow.",
      why: "A small, easy step on day one makes the next six feel possible.",
    },
    uk: {
      title: "Склянка води на початок",
      task: "Перед першою кавою чи чаєм випийте склянку води. Увечері поставте склянку на видне місце, щоб вона чекала на вас завтра.",
      why: "Маленький і легкий крок у перший день допомагає повірити, що решта шість днів теж під силу.",
    },
    ru: {
      title: "Стакан воды для начала",
      task: "Перед первым кофе или чаем выпейте стакан воды. Вечером поставьте стакан на видное место, чтобы он ждал вас завтра.",
      why: "Маленький и лёгкий шаг в первый день помогает поверить, что остальные шесть дней тоже по силам.",
    },
    el: {
      title: "Ένα ποτήρι νερό για αρχή",
      task: "Πριν από τον πρώτο καφέ ή τσάι, πιείτε ένα ποτήρι νερό. Το βράδυ αφήστε το ποτήρι σε σημείο που θα το δείτε, έτοιμο για αύριο.",
      why: "Ένα μικρό, εύκολο βήμα την πρώτη μέρα κάνει τις άλλες έξι να μοιάζουν εφικτές.",
    },
  },
  {
    day: 2,
    en: {
      title: "A ten-minute walk",
      task: "Take a ten-minute walk at a comfortable pace, outside or indoors. If ten minutes is too much today, walk for five.",
      why: "Public guidance encourages moving a little more and sitting a little less, and any amount counts.",
    },
    uk: {
      title: "Десять хвилин прогулянки",
      task: "Пройдіться десять хвилин у зручному темпі, надворі чи вдома. Якщо сьогодні десять хвилин забагато, пройдіться п’ять.",
      why: "Загальні рекомендації радять трохи більше рухатися й трохи менше сидіти, і будь-який рух рахується.",
    },
    ru: {
      title: "Десять минут прогулки",
      task: "Пройдитесь десять минут в удобном темпе, на улице или дома. Если сегодня десять минут слишком много, пройдитесь пять.",
      why: "Общие рекомендации советуют чуть больше двигаться и чуть меньше сидеть, и любое движение засчитывается.",
    },
    el: {
      title: "Ένας περίπατος δέκα λεπτών",
      task: "Περπατήστε δέκα λεπτά με άνετο ρυθμό, έξω ή μέσα στο σπίτι. Αν τα δέκα λεπτά είναι πολλά σήμερα, περπατήστε πέντε.",
      why: "Οι γενικές οδηγίες ενθαρρύνουν λίγη περισσότερη κίνηση και λιγότερο κάθισμα, και κάθε λεπτό μετράει.",
    },
  },
  {
    day: 3,
    en: {
      title: "Three slow breaths",
      task: "Twice today, stop and take three slow breaths: in through the nose, a longer breath out. Try once before a meal and once before sleep.",
      why: "A short pause is a simple way to notice how you feel before you carry on.",
    },
    uk: {
      title: "Три повільні вдихи",
      task: "Двічі сьогодні зупиніться й зробіть три повільні вдихи: вдих носом, довший видих. Спробуйте раз перед їжею і раз перед сном.",
      why: "Коротка пауза — простий спосіб помітити, як ви почуваєтеся, перш ніж іти далі.",
    },
    ru: {
      title: "Три медленных вдоха",
      task: "Дважды сегодня остановитесь и сделайте три медленных вдоха: вдох носом, более длинный выдох. Попробуйте раз перед едой и раз перед сном.",
      why: "Короткая пауза — простой способ заметить, как вы себя чувствуете, прежде чем продолжить.",
    },
    el: {
      title: "Τρεις αργές ανάσες",
      task: "Δύο φορές σήμερα σταματήστε και πάρτε τρεις αργές ανάσες: εισπνοή από τη μύτη, μεγαλύτερη εκπνοή. Δοκιμάστε μία φορά πριν από ένα γεύμα και μία πριν τον ύπνο.",
      why: "Μια μικρή παύση είναι ένας απλός τρόπος να προσέξετε πώς νιώθετε πριν συνεχίσετε.",
    },
  },
  {
    day: 4,
    en: {
      title: "One more vegetable or fruit",
      task: "Add one extra portion of vegetables or fruit to one meal today. A handful is enough.",
      why: "Public guidance suggests filling more of the plate with vegetables and fruit.",
    },
    uk: {
      title: "Ще один овоч чи фрукт",
      task: "Додайте сьогодні до однієї страви ще одну порцію овочів або фруктів. Жмені достатньо.",
      why: "Загальні рекомендації радять, щоб овочі й фрукти займали більшу частину тарілки.",
    },
    ru: {
      title: "Ещё один овощ или фрукт",
      task: "Добавьте сегодня к одному приёму пищи ещё одну порцию овощей или фруктов. Горсти достаточно.",
      why: "Общие рекомендации советуют, чтобы овощи и фрукты занимали большую часть тарелки.",
    },
    el: {
      title: "Ένα λαχανικό ή φρούτο ακόμα",
      task: "Προσθέστε σήμερα μία επιπλέον μερίδα λαχανικών ή φρούτων σε ένα γεύμα. Μια χούφτα αρκεί.",
      why: "Οι γενικές οδηγίες προτείνουν να γεμίζουμε μεγαλύτερο μέρος του πιάτου με λαχανικά και φρούτα.",
    },
  },
  {
    day: 5,
    en: {
      title: "A calmer last half hour",
      task: "Put your phone and screens away for the last thirty minutes before bed. Read, stretch gently, or simply rest instead.",
      why: "A quieter wind-down is one of the everyday sleep habits public guidance describes.",
    },
    uk: {
      title: "Спокійніші останні пів години",
      task: "Відкладіть телефон та інші екрани за тридцять хвилин до сну. Натомість почитайте, м’яко потягніться або просто відпочиньте.",
      why: "Спокійніший вечір — одна з повсякденних звичок для сну, про які йдеться в загальних рекомендаціях.",
    },
    ru: {
      title: "Более спокойные последние полчаса",
      task: "Отложите телефон и другие экраны за тридцать минут до сна. Вместо этого почитайте, мягко потянитесь или просто отдохните.",
      why: "Более спокойный вечер — одна из повседневных привычек для сна, о которых говорят общие рекомендации.",
    },
    el: {
      title: "Ένα πιο ήρεμο τελευταίο μισάωρο",
      task: "Αφήστε το κινητό και τις οθόνες στην άκρη τα τελευταία τριάντα λεπτά πριν τον ύπνο. Διαβάστε, τεντωθείτε απαλά ή απλώς ξεκουραστείτε.",
      why: "Ένα πιο ήσυχο κλείσιμο της μέρας είναι μία από τις καθημερινές συνήθειες ύπνου που περιγράφουν οι γενικές οδηγίες.",
    },
  },
  {
    day: 6,
    en: {
      title: "Reach out to someone",
      task: "Call, message, or visit one person you have not spoken to for a while. A short hello is enough.",
      why: "Feeling connected to other people is part of everyday wellbeing.",
    },
    uk: {
      title: "Зв’яжіться з кимось",
      task: "Зателефонуйте, напишіть або завітайте до людини, з якою давно не спілкувалися. Короткого «привіт» достатньо.",
      why: "Відчуття зв’язку з іншими людьми — частина повсякденного добробуту.",
    },
    ru: {
      title: "Свяжитесь с кем-нибудь",
      task: "Позвоните, напишите или навестите человека, с которым давно не общались. Короткого «привет» достаточно.",
      why: "Ощущение связи с другими людьми — часть повседневного благополучия.",
    },
    el: {
      title: "Επικοινωνήστε με κάποιον",
      task: "Τηλεφωνήστε, στείλτε μήνυμα ή επισκεφθείτε κάποιον με τον οποίο δεν έχετε μιλήσει καιρό. Ένα σύντομο γεια αρκεί.",
      why: "Η αίσθηση σύνδεσης με άλλους ανθρώπους είναι μέρος της καθημερινής ευεξίας.",
    },
  },
  {
    day: 7,
    en: {
      title: "Look back and keep one",
      task: "Look back at the last six days. Choose the one task that felt easiest and plan when you will do it again next week.",
      why: "Keeping one small habit is worth more than starting many and dropping them.",
    },
    uk: {
      title: "Озирніться й залиште одну звичку",
      task: "Згадайте останні шість днів. Оберіть завдання, яке далося найлегше, і заплануйте, коли зробите його знову наступного тижня.",
      why: "Одна збережена маленька звичка варта більше, ніж багато розпочатих і покинутих.",
    },
    ru: {
      title: "Оглянитесь и оставьте одну привычку",
      task: "Вспомните последние шесть дней. Выберите задание, которое далось легче всего, и запланируйте, когда сделаете его снова на следующей неделе.",
      why: "Одна сохранённая маленькая привычка стоит больше, чем много начатых и брошенных.",
    },
    el: {
      title: "Κοιτάξτε πίσω και κρατήστε μία",
      task: "Σκεφτείτε τις τελευταίες έξι μέρες. Διαλέξτε την εργασία που σας φάνηκε πιο εύκολη και σχεδιάστε πότε θα την κάνετε ξανά την επόμενη εβδομάδα.",
      why: "Μία μικρή συνήθεια που κρατάτε αξίζει περισσότερο από πολλές που ξεκινάτε και αφήνετε.",
    },
  },
];

export function dayText(day: number, locale: Locale): DayText | null {
  const entry = CHALLENGE_DAYS.find((item) => item.day === day);
  return entry ? entry[locale] : null;
}

/** Words around the task in each email. `{day}`, `{title}`, and `{link}` are filled in. */
export type EmailWords = {
  subject: string;
  greeting: string;
  whyLabel: string;
  open: string;
  footer: string;
  unsubscribe: string;
  finished: string;
};

export const EMAIL_WORDS: Record<Locale, EmailWords> = {
  en: {
    subject: "LifeZoi 7-day challenge · Day {day}: {title}",
    greeting: "Here is your task for day {day} of 7.",
    whyLabel: "Why it helps:",
    open: "See all seven days on LifeZoi: {link}",
    footer: "You asked for these emails in LifeZoi. LifeZoi is for everyday habits and education. It does not diagnose or replace your doctor.",
    unsubscribe: "Stop these emails with one click: {link}",
    finished: "This was the last day. Thank you for taking part. No more challenge emails will be sent.",
  },
  uk: {
    subject: "7-денний виклик LifeZoi · День {day}: {title}",
    greeting: "Ось ваше завдання на день {day} із 7.",
    whyLabel: "Чому це корисно:",
    open: "Усі сім днів на LifeZoi: {link}",
    footer: "Ви самі попросили ці листи в LifeZoi. LifeZoi — про повсякденні звички й освіту. Він не ставить діагнозів і не замінює лікаря.",
    unsubscribe: "Відписатися від цих листів одним натисканням: {link}",
    finished: "Це був останній день. Дякуємо, що взяли участь. Більше листів виклику не буде.",
  },
  ru: {
    subject: "7-дневный челлендж LifeZoi · День {day}: {title}",
    greeting: "Вот ваше задание на день {day} из 7.",
    whyLabel: "Почему это полезно:",
    open: "Все семь дней на LifeZoi: {link}",
    footer: "Вы сами попросили эти письма в LifeZoi. LifeZoi — о повседневных привычках и образовании. Он не ставит диагнозов и не заменяет врача.",
    unsubscribe: "Отписаться от этих писем одним нажатием: {link}",
    finished: "Это был последний день. Спасибо, что участвовали. Больше писем челленджа не будет.",
  },
  el: {
    subject: "Πρόκληση 7 ημερών LifeZoi · Ημέρα {day}: {title}",
    greeting: "Αυτή είναι η εργασία σας για την ημέρα {day} από τις 7.",
    whyLabel: "Γιατί βοηθά:",
    open: "Δείτε και τις επτά μέρες στο LifeZoi: {link}",
    footer: "Ζητήσατε αυτά τα email στο LifeZoi. Το LifeZoi αφορά καθημερινές συνήθειες και ενημέρωση. Δεν κάνει διάγνωση και δεν αντικαθιστά τον γιατρό σας.",
    unsubscribe: "Διακοπή αυτών των email με ένα κλικ: {link}",
    finished: "Αυτή ήταν η τελευταία μέρα. Ευχαριστούμε που συμμετείχατε. Δεν θα σταλούν άλλα email της πρόκλησης.",
  },
};
