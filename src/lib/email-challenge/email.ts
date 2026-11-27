import { fmt, type Locale } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/site";
import { CHALLENGE_LENGTH, dayText, EMAIL_WORDS } from "./content";
import type { OutboundEmail } from "./mailer";
import type { Signup } from "./types";

export const CHALLENGE_PATH = "/free/challenge";

export function stopLink(token: string, origin = SITE_ORIGIN): string {
  return `${origin}${CHALLENGE_PATH}/stop?token=${encodeURIComponent(token)}`;
}

export function confirmLink(token: string, origin = SITE_ORIGIN): string {
  return `${origin}${CHALLENGE_PATH}/confirm?token=${encodeURIComponent(token)}`;
}

/** Headers so mail apps show their own one-click "Unsubscribe" button (RFC 8058). */
function unsubscribeHeaders(token: string, origin: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${origin}/api/challenge/unsubscribe?token=${encodeURIComponent(token)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

/** The email for one day. Plain text: the task, why, a link back, and a one-click stop link. */
export function dayEmail(signup: Pick<Signup, "email" | "locale" | "unsubscribeToken">, day: number, origin = SITE_ORIGIN): OutboundEmail | null {
  const content = dayText(day, signup.locale);
  if (!content) return null;
  const words = EMAIL_WORDS[signup.locale];
  const lines = [
    fmt(words.greeting, { day }),
    "",
    content.title,
    content.task,
    "",
    `${words.whyLabel} ${content.why}`,
    "",
    fmt(words.open, { link: `${origin}${CHALLENGE_PATH}` }),
  ];
  if (day === CHALLENGE_LENGTH) lines.push("", words.finished);
  lines.push("", "—", words.footer, fmt(words.unsubscribe, { link: stopLink(signup.unsubscribeToken, origin) }));
  return {
    to: signup.email,
    subject: fmt(words.subject, { day, title: content.title }),
    text: lines.join("\n"),
    headers: unsubscribeHeaders(signup.unsubscribeToken, origin),
  };
}

const CONFIRM_WORDS: Record<Locale, { subject: string; body: string; ignore: string }> = {
  en: {
    subject: "Confirm your LifeZoi 7-day challenge",
    body: "Someone, hopefully you, asked for the LifeZoi 7-day challenge at this address. To start getting one short task a day, confirm here: {link}",
    ignore: "If this was not you, ignore this email. Nothing more will be sent, and the address is deleted after 14 days.",
  },
  uk: {
    subject: "Підтвердьте 7-денний виклик LifeZoi",
    body: "Хтось, сподіваємося, ви, попросив 7-денний виклик LifeZoi на цю адресу. Щоб щодня отримувати одне коротке завдання, підтвердьте тут: {link}",
    ignore: "Якщо це були не ви, просто проігноруйте цей лист. Більше нічого не надійде, а адресу буде видалено через 14 днів.",
  },
  ru: {
    subject: "Подтвердите 7-дневный челлендж LifeZoi",
    body: "Кто-то, надеемся, вы, попросил 7-дневный челлендж LifeZoi на этот адрес. Чтобы каждый день получать одно короткое задание, подтвердите здесь: {link}",
    ignore: "Если это были не вы, просто проигнорируйте это письмо. Больше ничего не придёт, а адрес будет удалён через 14 дней.",
  },
  el: {
    subject: "Επιβεβαιώστε την πρόκληση 7 ημερών του LifeZoi",
    body: "Κάποιος, ελπίζουμε εσείς, ζήτησε την πρόκληση 7 ημερών του LifeZoi σε αυτή τη διεύθυνση. Για να λαμβάνετε μία σύντομη εργασία την ημέρα, επιβεβαιώστε εδώ: {link}",
    ignore: "Αν δεν ήσασταν εσείς, αγνοήστε αυτό το email. Δεν θα σταλεί τίποτε άλλο και η διεύθυνση διαγράφεται μετά από 14 ημέρες.",
  },
};

/** The one confirmation email a visitor's address gets. It is never sent twice. */
export function confirmEmail(signup: Pick<Signup, "email" | "locale" | "confirmToken" | "unsubscribeToken">, origin = SITE_ORIGIN): OutboundEmail {
  const words = CONFIRM_WORDS[signup.locale];
  return {
    to: signup.email,
    subject: words.subject,
    text: [fmt(words.body, { link: confirmLink(signup.confirmToken, origin) }), "", words.ignore].join("\n"),
    headers: unsubscribeHeaders(signup.unsubscribeToken, origin),
  };
}
