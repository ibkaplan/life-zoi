import { containsProhibitedClaim } from "@/lib/claims";

export const PURPOSE_KEY = "lifezoi.purpose.v1";

export const CENTRAL_MESSAGE = "Your Life Is More Than Your Lifetime.";

export const SUPPORTING_MESSAGE =
  "Your health is not only about you. It is about the love you share, the people you support, the ideas you create, and the good you bring into the world.";

export const DIRECTION_LINES = [
  "Your health gives you possibilities.",
  "Your choices give your life direction.",
  "Your kindness gives the world something valuable.",
] as const;

export const BRAND_LINE = "LifeZoi — Live Longer. Live Better. Make Life Matter.";

export const BRAND_SUPPORT =
  "Your health is your opportunity to create a better future — for yourself and for the people around you.";

export const PROMISE_BOUNDARY =
  "lifeZoi does not promise a longer life, immortality, disease prevention, or healing. Everyday care can widen what feels possible. It does not measure a person's worth.";

export const HEALTH_BRIDGE = "Your health goals can support the life you want to live.";

export const DIGNITY_NOTE =
  "People living with disabilities, chronic illnesses, or other limits have meaningful lives and can make important contributions. You do not need to be perfectly healthy to be valuable or helpful.";

export const KARMA_NOTE =
  "Positive karma, in lifeZoi, is a philosophical and cultural metaphor for how choices can ripple through a family or community. It is not a scientifically proven medical principle, and it does not guarantee fortune, healing, or a longer life.";

export const ENCOURAGEMENT =
  "An empty page is not a failure. You can begin with one sentence, change it later, or leave it for another day.";

export const FOUNDATIONS = [
  {
    id: "science",
    title: "Science",
    text: "Reliable medical research, evidence-based lifestyle education, and trustworthy health information. Suggestions stay general. A clinician is the right person for personal medical decisions.",
  },
  {
    id: "psychology",
    title: "Psychology",
    text: "Positive motivation, personal goals, self-awareness, and sustainable habit formation. A small action you can repeat is more useful than a perfect streak.",
  },
  {
    id: "philosophy",
    title: "Philosophy",
    text: "Purpose, kindness, responsibility, and the good a person can offer other people and the world. Positive karma is a metaphor for those ripples, not a medical claim.",
  },
] as const;

export const LEGACY_QUESTIONS = [
  { id: "accomplish", prompt: "What good would you like to accomplish in your lifetime?" },
  { id: "help", prompt: "Who would you like to help?" },
  { id: "teach", prompt: "What would you like to teach or share with others?" },
  { id: "experiences", prompt: "What experiences do you still want to have?" },
  { id: "become", prompt: "What kind of person would you like to become in five years?" },
  { id: "mark", prompt: "What positive mark would you like to leave on the world?" },
  { id: "meaning", prompt: "What would make your life feel meaningful?" },
] as const;

export type LegacyId = (typeof LEGACY_QUESTIONS)[number]["id"];

export const MILESTONE_KINDS = [
  ["goal", "Personal goal"],
  ["habit", "Healthy habit"],
  ["skill", "New skill"],
  ["action", "Positive action"],
  ["loved", "Time with loved ones"],
  ["achievement", "Personal achievement"],
  ["community", "Community contribution"],
] as const;

export type MilestoneKind = (typeof MILESTONE_KINDS)[number][0];

export const RIPPLE_KINDS = [
  ["help", "Helping someone"],
  ["share", "Sharing knowledge"],
  ["family", "Supporting a family member"],
  ["nature", "Caring for nature"],
  ["volunteer", "Volunteering"],
  ["encourage", "Encouraging another person"],
  ["self", "A positive change in my own life"],
] as const;

export type RippleKind = (typeof RIPPLE_KINDS)[number][0];

export const JOURNEY_STEPS = [
  {
    id: "discover",
    title: "Discover",
    text: "Reflect on what makes life meaningful. There is no wrong answer.",
    href: "#legacy",
    linkLabel: "Open My Positive Legacy",
  },
  {
    id: "connect",
    title: "Connect",
    text: "Connect a meaningful hope with a health or lifestyle priority you can actually practice.",
    href: "#connect",
    linkLabel: "See health connections",
  },
  {
    id: "plan",
    title: "Plan",
    text: "Choose one small weekly action. Change Lab can hold the experiment.",
    href: "/change-lab",
    linkLabel: "Open Change Lab",
  },
  {
    id: "act",
    title: "Act",
    text: "Record a day of practice, or a kindness you chose to remember.",
    href: "/progress",
    linkLabel: "Open Progress",
  },
  {
    id: "reflect",
    title: "Reflect",
    text: "Look at what changed in your notes. WHAT IF? can illustrate one habit beside public guidance.",
    href: "/what-if",
    linkLabel: "Open WHAT IF?",
  },
  {
    id: "grow",
    title: "Grow",
    text: "Update a hope or add a milestone when you are ready. Skipping a week is allowed.",
    href: "#impact",
    linkLabel: "Update milestones",
  },
] as const;

export type Milestone = {
  id: string;
  title: string;
  kind: MilestoneKind;
  note: string;
  done: boolean;
  createdAt: string;
};

export type Ripple = {
  id: string;
  kind: RippleKind;
  note: string;
  createdAt: string;
};

export type PurposeState = {
  version: 1;
  legacy: Partial<Record<LegacyId, string>>;
  milestones: Milestone[];
  ripples: Ripple[];
  updatedAt: string;
};

export type HealthSupport = {
  id: string;
  title: string;
  why: string;
  actions: string[];
};

const TEXT_LIMIT = 400;
const TITLE_LIMIT = 80;

const THEMES: Array<HealthSupport & { pattern: RegExp }> = [
  {
    id: "travel",
    pattern: /\b(travel|grandchildren|grandchild|family|walking|walk|trip|visit|active)\b/,
    title: "Energy for time with people",
    why: "A hope to travel or spend active time with family can be supported by ordinary movement, balance, and sleep. It does not require perfect health.",
    actions: [
      "A short walk on days that already have a little room.",
      "Simple balance practice near a sturdy support. Stop if you feel unsteady.",
      "A regular sleep window.",
      "Ask a clinician which movement is suitable if you have pain, dizziness, or a condition that changes what is safe.",
    ],
  },
  {
    id: "create",
    pattern: /\b(business|work|career|create|project|study|learn|build)\b/,
    title: "A routine you can sustain",
    why: "Creating something, including a business or a skill, is easier to continue when the day has room for rest and movement.",
    actions: [
      "One realistic start and stop time for the work you care about.",
      "A short movement break during long sitting.",
      "One stress practice you already know, such as a quiet walk or slow breathing.",
    ],
  },
  {
    id: "community",
    pattern: /\b(community|volunteering|volunteer|helping|help|teach|share|neighbor|others)\b/,
    title: "Connection and contribution",
    why: "Helping other people can sit beside habits that support your own energy. Contribution does not require you to be well in every way.",
    actions: [
      "One realistic way to see or talk with other people this week.",
      "A volunteering or sharing idea that fits your energy, including a small one.",
      "A habit that helps you feel steady enough to show up, such as sleep or a short walk.",
    ],
  },
  {
    id: "nature",
    pattern: /\b(nature|planet|garden|earth|outdoors|tree|trees)\b/,
    title: "Time outside",
    why: "Caring for a place, a garden, or a local patch of nature can be a purpose and a gentle reason to move.",
    actions: [
      "A short time outdoors on a day that feels workable.",
      "One small act of care for a place you already know.",
    ],
  },
];

export function emptyPurpose(): PurposeState {
  return { version: 1, legacy: {}, milestones: [], ripples: [], updatedAt: "" };
}

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F]/g, "").slice(0, max);
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value);
}

function milestoneKind(value: unknown): MilestoneKind | null {
  return MILESTONE_KINDS.some((item) => item[0] === value) ? (value as MilestoneKind) : null;
}

function rippleKind(value: unknown): RippleKind | null {
  return RIPPLE_KINDS.some((item) => item[0] === value) ? (value as RippleKind) : null;
}

export function sanitizePurpose(input: unknown): PurposeState {
  if (!input || typeof input !== "object") return emptyPurpose();
  const row = input as Record<string, unknown>;
  const legacy: PurposeState["legacy"] = {};
  const source = row.legacy && typeof row.legacy === "object" ? (row.legacy as Record<string, unknown>) : {};
  for (const question of LEGACY_QUESTIONS) {
    const text = clip(source[question.id], TEXT_LIMIT);
    if (text) legacy[question.id] = text;
  }
  const milestones = Array.isArray(row.milestones)
    ? row.milestones
        .map((item): Milestone | null => {
          if (!item || typeof item !== "object") return null;
          const record = item as Record<string, unknown>;
          const kind = milestoneKind(record.kind);
          const title = clip(record.title, TITLE_LIMIT).trim();
          if (!kind || !title || typeof record.id !== "string" || !isIso(record.createdAt)) return null;
          return {
            id: record.id.slice(0, 80),
            title,
            kind,
            note: clip(record.note, TEXT_LIMIT).trim(),
            done: record.done === true,
            createdAt: record.createdAt,
          };
        })
        .filter((item): item is Milestone => item !== null)
        .slice(-30)
    : [];
  const ripples = Array.isArray(row.ripples)
    ? row.ripples
        .map((item): Ripple | null => {
          if (!item || typeof item !== "object") return null;
          const record = item as Record<string, unknown>;
          const kind = rippleKind(record.kind);
          if (!kind || typeof record.id !== "string" || !isIso(record.createdAt)) return null;
          return {
            id: record.id.slice(0, 80),
            kind,
            note: clip(record.note, TEXT_LIMIT).trim(),
            createdAt: record.createdAt,
          };
        })
        .filter((item): item is Ripple => item !== null)
        .slice(-40)
    : [];
  return {
    version: 1,
    legacy,
    milestones,
    ripples,
    updatedAt: isIso(row.updatedAt) ? row.updatedAt : "",
  };
}

export function purposeLines(legacy: PurposeState["legacy"]): string[] {
  return LEGACY_QUESTIONS.flatMap((question) => {
    const text = legacy[question.id]?.trim();
    return text ? [`${question.prompt} ${text}`] : [];
  });
}

export function healthSupports(corpus: string): HealthSupport[] {
  const matched = THEMES.filter((theme) => theme.pattern.test(corpus.toLowerCase())).map((theme) => ({
    id: theme.id,
    title: theme.title,
    why: theme.why,
    actions: theme.actions,
  }));
  if (matched.length > 0) return matched;
  if (!corpus.trim()) return [];
  return [
    {
      id: "general",
      title: "One workable habit",
      why: "Your words do not have to match a category. A single habit you can repeat is enough to support a hope.",
      actions: ["Choose one small action for this week and leave the rest for later."],
    },
  ];
}

export function weeklyActions(supports: HealthSupport[]): string[] {
  return supports.map((support) => support.actions[0]).filter((action): action is string => Boolean(action)).slice(0, 4);
}

export function purposeReflection(hope: string): string {
  const text = hope.trim();
  if (!text) return "";
  return `You shared this hope: “${text}”. Let's build a realistic lifestyle plan that supports your goals. ${HEALTH_BRIDGE}`;
}

export function publicPurposeCopy(): string[] {
  return [
    CENTRAL_MESSAGE,
    SUPPORTING_MESSAGE,
    ...DIRECTION_LINES,
    BRAND_LINE,
    BRAND_SUPPORT,
    PROMISE_BOUNDARY,
    HEALTH_BRIDGE,
    DIGNITY_NOTE,
    KARMA_NOTE,
    ENCOURAGEMENT,
    ...FOUNDATIONS.map((item) => `${item.title} ${item.text}`),
    ...LEGACY_QUESTIONS.map((item) => item.prompt),
    ...JOURNEY_STEPS.map((item) => `${item.title} ${item.text}`),
    ...THEMES.flatMap((theme) => [theme.title, theme.why, ...theme.actions]),
  ];
}

export function purposeCopyIsEducational(): boolean {
  return !containsProhibitedClaim(publicPurposeCopy().join("\n"));
}

const listeners = new Set<() => void>();
let clientState: PurposeState | null = null;

export function subscribePurpose(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPurpose(): PurposeState {
  if (typeof window === "undefined") return emptyPurpose();
  if (!clientState) {
    try {
      clientState = sanitizePurpose(JSON.parse(window.sessionStorage.getItem(PURPOSE_KEY) ?? "null"));
    } catch {
      clientState = emptyPurpose();
    }
  }
  return clientState;
}

export function getPurposeServer(): PurposeState {
  return emptyPurpose();
}

export function writePurpose(next: PurposeState) {
  const clean = sanitizePurpose({ ...next, version: 1, updatedAt: new Date().toISOString() });
  clientState = clean;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(PURPOSE_KEY, JSON.stringify(clean));
  }
  listeners.forEach((listener) => listener());
}

export function clearPurpose(storage: Pick<Storage, "removeItem"> | null) {
  storage?.removeItem(PURPOSE_KEY);
  clientState = emptyPurpose();
  listeners.forEach((listener) => listener());
}

export function kindLabel(kind: string, list: readonly (readonly [string, string])[]): string {
  return list.find((item) => item[0] === kind)?.[1] ?? kind;
}
