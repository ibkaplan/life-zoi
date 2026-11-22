import { beforeEach, describe, expect, it } from "vitest";
import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";
import {
  findArticle,
  inCategory,
  readingMinutes,
  relatedArticles,
  searchArticles,
  visibleArticles,
  type EditorialRecord,
} from "@/lib/encyclopedia/catalog";
import { CATEGORIES, ENCYCLOPEDIA_DISCLAIMER, SAFETY_NOTES } from "@/lib/encyclopedia/categories";
import { GLOSSARY } from "@/lib/encyclopedia/glossary";
import { TIMELINE, TIMELINE_ERAS } from "@/lib/encyclopedia/timeline";
import { CATEGORY_SLUGS, EVIDENCE_LEVELS, SAFETY_TOPICS, STUDY_TYPES, type Article } from "@/lib/encyclopedia/types";
import { isSafeUrl, validateArticle } from "@/lib/encyclopedia/validate";
import { listForAdmin, listForReaders, saveForAdmin, setStatusForAdmin } from "@/lib/encyclopedia/service";
import type { EncyclopediaStore } from "@/lib/encyclopedia/store";
import { libraryAnswer, matchArticles, searchTextFor, NO_ARTICLE_TEXT } from "@/lib/encyclopedia/ai/answer";
import { chooseProvider } from "@/lib/encyclopedia/ai/provider";
import {
  AI_LIMITS,
  cleanTurns,
  DIAGNOSIS_TEXT,
  handleQuestion,
  MEDICATION_TEXT,
  resetAiUsageForTests,
  takeQuestion,
} from "@/lib/encyclopedia/ai/handle";
import { SAFETY_NOTICE } from "@/lib/assistant";

const TODAY = "2026-11-22";
const admin = { id: "00000000-0000-4000-8000-000000000001", email: "editor@example.com", isAdmin: true };

function article(slug: string): Article {
  const found = BUILT_IN_ARTICLES.find((item) => item.slug === slug);
  if (!found) throw new Error(`missing ${slug}`);
  return found;
}

describe("seeded encyclopedia content", () => {
  it("has unique slugs and valid categories, and every category has an article", () => {
    const slugs = BUILT_IN_ARTICLES.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const item of BUILT_IN_ARTICLES) {
      expect(CATEGORY_SLUGS).toContain(item.category);
      for (const also of item.alsoIn ?? []) expect(CATEGORY_SLUGS).toContain(also);
    }
    expect(CATEGORIES.map((category) => category.slug).sort()).toEqual([...CATEGORY_SLUGS].sort());
    for (const slug of CATEGORY_SLUGS) expect(inCategory(slug, BUILT_IN_ARTICLES).length, slug).toBeGreaterThan(0);
  });

  it("gives every article https sources, evidence labels, takeaways, and a risks section", () => {
    for (const item of BUILT_IN_ARTICLES) {
      expect(item.references.length, item.slug).toBeGreaterThan(0);
      for (const reference of item.references) {
        expect(isSafeUrl(reference.url), `${item.slug}: ${reference.url}`).toBe(true);
        expect(reference.title.length).toBeGreaterThan(0);
        expect(reference.publisher.length).toBeGreaterThan(0);
      }
      expect(item.evidence.length, item.slug).toBeGreaterThan(0);
      for (const claim of item.evidence) {
        expect(EVIDENCE_LEVELS).toContain(claim.level);
        expect(STUDY_TYPES).toContain(claim.basis);
      }
      expect(item.takeaways.length, item.slug).toBeGreaterThan(0);
      expect(item.sections.length, item.slug).toBeGreaterThanOrEqual(3);
      // Every article says what is uncertain or when to see a professional.
      expect(item.sections.some((section) => /^(Risks|When to consult)/.test(section.heading)), item.slug).toBe(true);
      expect(item.easySummary.length).toBeGreaterThan(0);
      expect(readingMinutes(item)).toBeGreaterThanOrEqual(1);
      for (const topic of item.safety ?? []) expect(SAFETY_TOPICS).toContain(topic);
    }
  });

  it("marks seeded articles as drafts waiting for professional review", () => {
    for (const item of BUILT_IN_ARTICLES) {
      expect(item.review, item.slug).toBeUndefined();
      expect(item.draftedBy).toMatch(/AI assistance/);
    }
  });

  it("puts the required safety notes on cancer, fasting, diabetes, and heart topics", () => {
    expect(inCategory("fasting-metabolism", BUILT_IN_ARTICLES).length).toBeGreaterThan(1);
    for (const item of inCategory("cancer", BUILT_IN_ARTICLES)) expect(item.safety, item.slug).toContain("cancer");
    for (const item of inCategory("fasting-metabolism", BUILT_IN_ARTICLES)) {
      expect(item.safety, item.slug).toContain("fasting");
      expect(item.safety, item.slug).toContain("diabetes");
    }
    expect(article("heart-health-blood-pressure-cholesterol").safety).toContain("heart");
    expect(SAFETY_NOTES.cancer.text).toMatch(/oncology professionals/);
    expect(SAFETY_NOTES.fasting.text).toMatch(/Do not stop or change any medicine/);
  });

  it("keeps the disclaimer word for word", () => {
    expect(ENCYCLOPEDIA_DISCLAIMER).toBe(
      "LifeZoi Health Encyclopedia provides educational information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional about personal medical decisions.",
    );
  });

  it("only links glossary terms that exist", () => {
    const ids = new Set(GLOSSARY.map((term) => term.id));
    expect(ids.size).toBe(GLOSSARY.length);
    for (const item of BUILT_IN_ARTICLES) for (const id of item.terms ?? []) expect(ids.has(id), `${item.slug}: ${id}`).toBe(true);
  });

  it("gives every timeline event a source, a known era, and an existing related article", () => {
    const eras = new Set(TIMELINE_ERAS.map((era) => era.id));
    const ids = TIMELINE.map((event) => event.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const event of TIMELINE) {
      expect(eras.has(event.era), event.id).toBe(true);
      expect(event.sources.length, event.id).toBeGreaterThan(0);
      for (const source of event.sources) expect(isSafeUrl(source.url), `${event.id}: ${source.url}`).toBe(true);
      if (event.articleSlug) expect(findArticle(event.articleSlug, BUILT_IN_ARTICLES), event.id).toBeDefined();
      if (event.era === "future") expect(event.status).toBe("research");
    }
    for (const era of eras) expect(TIMELINE.some((event) => event.era === era), era).toBe(true);
  });
});

describe("editorial versions", () => {
  const vaccines = article("vaccines-sixty-years");
  const record = (status: EditorialRecord["status"], value: Article): EditorialRecord => ({ slug: value.slug, status, article: value, updatedAt: TODAY });

  it("replaces a built-in article only with a published version", () => {
    const edited = { ...vaccines, title: "Vaccines, edited" };
    expect(findArticle(vaccines.slug, visibleArticles([record("draft", edited)]))?.title).toBe(vaccines.title);
    expect(findArticle(vaccines.slug, visibleArticles([record("in_review", edited)]))?.title).toBe(vaccines.title);
    expect(findArticle(vaccines.slug, visibleArticles([record("published", edited)]))?.title).toBe("Vaccines, edited");
  });

  it("hides an archived article and adds new published ones", () => {
    expect(findArticle(vaccines.slug, visibleArticles([record("archived", vaccines)]))).toBeUndefined();
    const fresh = { ...vaccines, slug: "a-new-article", title: "A new article" };
    const shown = visibleArticles([record("published", fresh), record("draft", { ...fresh, slug: "a-draft" })]);
    expect(findArticle("a-new-article", shown)).toBeDefined();
    expect(findArticle("a-draft", shown)).toBeUndefined();
    expect(shown.length).toBe(BUILT_IN_ARTICLES.length + 1);
  });
});

describe("search and related articles", () => {
  it("finds articles by topic words", () => {
    expect(searchArticles("immunotherapy", BUILT_IN_ARTICLES)[0]?.slug).toBe("modern-cancer-treatments");
    expect(searchArticles("intermittent fasting", BUILT_IN_ARTICLES).map((item) => item.slug)).toContain("intermittent-fasting-research");
    expect(searchArticles("acupuncture", BUILT_IN_ARTICLES)[0]?.slug).toBe("acupuncture");
    expect(searchArticles("vaccines", BUILT_IN_ARTICLES)[0]?.slug).toBe("vaccines-sixty-years");
  });

  it("returns nothing for empty or stop-word-only searches", () => {
    expect(searchArticles("", BUILT_IN_ARTICLES)).toEqual([]);
    expect(searchArticles("what is the", BUILT_IN_ARTICLES)).toEqual([]);
    expect(searchArticles("zzqxw", BUILT_IN_ARTICLES)).toEqual([]);
  });

  it("suggests related articles without the article itself", () => {
    const related = relatedArticles(article("acupuncture"), BUILT_IN_ARTICLES);
    expect(related.length).toBeGreaterThan(0);
    expect(related.map((item) => item.slug)).not.toContain("acupuncture");
  });
});

describe("article validation", () => {
  const base = () => JSON.parse(JSON.stringify(article("acupuncture"))) as Record<string, unknown>;

  it("accepts a built-in article as a draft and strips markup", () => {
    const input = { ...base(), title: "<b>Acupuncture</b>" };
    const checked = validateArticle(input, "draft", TODAY);
    expect(checked.ok).toBe(true);
    if (checked.ok) expect(checked.value.title).not.toMatch(/[<>]/);
  });

  it("refuses to publish without a review by a named reviewer", () => {
    const checked = validateArticle(base(), "published", TODAY);
    expect(checked.ok).toBe(false);
    const reviewed = { ...base(), review: { reviewer: "Dr. Example Reviewer", reviewedOn: TODAY } };
    expect(validateArticle(reviewed, "published", TODAY).ok).toBe(true);
    const future = { ...base(), review: { reviewer: "Dr. Example Reviewer", reviewedOn: "2099-01-01" } };
    expect(validateArticle(future, "published", TODAY).ok).toBe(false);
  });

  it("refuses unsafe links, a bad slug, and images without alt text or a license", () => {
    expect(validateArticle({ ...base(), references: [{ title: "x", publisher: "y", url: "javascript:alert(1)" }] }, "draft", TODAY).ok).toBe(false);
    expect(validateArticle({ ...base(), slug: "Bad Slug" }, "draft", TODAY).ok).toBe(false);
    expect(validateArticle({ ...base(), image: { url: "https://example.org/a.jpg", alt: "" } }, "draft", TODAY).ok).toBe(false);
    expect(validateArticle({ ...base(), image: { url: "https://example.org/a.jpg", alt: "A person" } }, "draft", TODAY).ok).toBe(false);
    expect(isSafeUrl("https://user:pass@example.org")).toBe(false);
    expect(isSafeUrl("http://example.org")).toBe(false);
  });
});

describe("editorial service", () => {
  function fakeStore(): EncyclopediaStore & { rows: Map<string, EditorialRecord> } {
    const rows = new Map<string, EditorialRecord>();
    return {
      rows,
      listPublished: async () => [...rows.values()].filter((row) => row.status === "published"),
      listAll: async () => [...rows.values()].map((row) => ({ ...row, updatedBy: admin.id })),
      save: async ({ slug, status, article: value }) => void rows.set(slug, { slug, status, article: value, updatedAt: TODAY }),
      setStatus: async (slug, status) => {
        const row = rows.get(slug);
        if (!row) return false;
        rows.set(slug, { ...row, status });
        return true;
      },
      get: async (slug) => rows.get(slug) ?? null,
    };
  }

  it("keeps reading open when storage is missing or broken", async () => {
    expect(await listForReaders(null)).toEqual({ status: 200, body: { records: [], storage: "not-configured" } });
    const broken = { ...fakeStore(), listPublished: async () => Promise.reject(new Error("no table")) };
    expect((await listForReaders(broken)).body.storage).toBe("unavailable");
    expect((await listForAdmin(null)).status).toBe(503);
  });

  it("saves a draft, then publishes only once it has a review", async () => {
    const store = fakeStore();
    const draft = await saveForAdmin(admin, { article: article("acupuncture"), status: "draft" }, store, TODAY);
    expect(draft.status).toBe(200);
    expect((await listForReaders(store)).body.records).toEqual([]);
    expect((await setStatusForAdmin(admin, { slug: "acupuncture", status: "published" }, store, TODAY)).status).toBe(400);
    const reviewed = { ...article("acupuncture"), review: { reviewer: "Dr. Example Reviewer", reviewedOn: TODAY } };
    expect((await saveForAdmin(admin, { article: reviewed, status: "in_review" }, store, TODAY)).status).toBe(200);
    expect((await setStatusForAdmin(admin, { slug: "acupuncture", status: "published" }, store, TODAY)).status).toBe(200);
    expect(((await listForReaders(store)).body.records as EditorialRecord[]).map((row) => row.slug)).toEqual(["acupuncture"]);
    expect((await setStatusForAdmin(admin, { slug: "unknown-slug", status: "archived" }, store, TODAY)).status).toBe(404);
    expect((await saveForAdmin(admin, { article: reviewed, status: "live" }, store, TODAY)).status).toBe(400);
  });
});

describe("LifeZoi AI answers", () => {
  const ask = (...texts: string[]) => texts.map((text, index) => ({ role: index % 2 === 0 ? "user" : "assistant", text }) as const);

  it("answers from matching articles with cards", () => {
    const answer = libraryAnswer({ turns: ask("How can I protect my heart?"), length: "short", articles: BUILT_IN_ARTICLES });
    expect(answer.noArticle).toBe(false);
    expect(answer.source).toBe("library");
    expect(answer.articles[0]?.slug).toBe("heart-health-blood-pressure-cholesterol");
    expect(answer.blocks.length).toBeGreaterThan(0);
    const detailed = libraryAnswer({ turns: ask("How can I protect my heart?"), length: "detailed", articles: BUILT_IN_ARTICLES });
    expect(JSON.stringify(detailed.blocks).length).toBeGreaterThan(JSON.stringify(answer.blocks).length);
  });

  it("uses the earlier question for a short follow-up", () => {
    const turns = ask("What is intermittent fasting?", "fasting", "Is it safe?");
    expect(searchTextFor(turns).usedContext).toBe(true);
    expect(matchArticles(searchTextFor(turns).text, BUILT_IN_ARTICLES).map((item) => item.slug)).toContain("intermittent-fasting-research");
  });

  it("says when there is no dedicated article yet", () => {
    const answer = libraryAnswer({ turns: ask("Tell me about zzqxw frobnication"), length: "short", articles: BUILT_IN_ARTICLES });
    expect(answer.noArticle).toBe(true);
    expect(answer.articles).toEqual([]);
    expect(JSON.stringify(answer.blocks)).toContain(NO_ARTICLE_TEXT[0]);
  });

  it("answers about the article a member came from", () => {
    const answer = libraryAnswer({ turns: ask("What are the risks?"), length: "short", articles: BUILT_IN_ARTICLES, focusSlug: "acupuncture" });
    expect(answer.articles[0]?.slug).toBe("acupuncture");
  });
});

describe("LifeZoi AI safety and limits", () => {
  const library = chooseProvider({});
  const run = (text: string, memberId = "member-a", now = new Date("2026-11-22T10:00:00Z")) =>
    handleQuestion({ memberId, turns: [{ role: "user", text }], length: "short", focusSlug: undefined }, { choice: library, articles: BUILT_IN_ARTICLES, now });

  beforeEach(() => resetAiUsageForTests());

  it("only allows the library provider and makes no network call otherwise", async () => {
    expect(library.ok).toBe(true);
    const refused = chooseProvider({ ENCYCLOPEDIA_AI_PROVIDER: "gemini" });
    expect(refused.ok).toBe(false);
    const result = await handleQuestion(
      { memberId: "member-a", turns: [{ role: "user", text: "heart" }], length: "short", focusSlug: undefined },
      { choice: refused, articles: BUILT_IN_ARTICLES },
    );
    expect(result.status).toBe(503);
  });

  it("puts emergency guidance first for urgent symptoms, with no article answer", async () => {
    const result = await run("I have crushing chest pain and can't breathe");
    const answer = result.body.answer as { safety?: string; blocks: { text?: string }[]; articles: unknown[] };
    expect(answer.safety).toBe("urgent");
    expect(answer.blocks[0]?.text).toBe(SAFETY_NOTICE);
    expect(answer.articles).toEqual([]);
  });

  it("never advises stopping medicine, and does not diagnose", async () => {
    const medicine = (await run("Should I stop taking my blood pressure medication?")).body.answer as { safety?: string; blocks: { text?: string }[] };
    expect(medicine.safety).toBe("medication");
    expect(medicine.blocks[0]?.text).toBe(MEDICATION_TEXT);
    const diagnosis = (await run("Do I have diabetes?")).body.answer as { safety?: string; blocks: { text?: string }[] };
    expect(diagnosis.safety).toBe("diagnosis");
    expect(diagnosis.blocks[0]?.text).toBe(DIAGNOSIS_TEXT);
  });

  it("rejects an empty question", async () => {
    expect((await run("   ")).status).toBe(400);
  });

  it("limits each member per minute and per day", () => {
    const start = new Date("2026-11-22T10:00:00Z");
    for (let i = 0; i < AI_LIMITS.perMinute; i += 1) expect(takeQuestion("member-b", start)).toBe("ok");
    expect(takeQuestion("member-b", start)).toBe("minute");
    expect(takeQuestion("member-c", start)).toBe("ok");
    let minute = start.getTime();
    let count = AI_LIMITS.perMinute;
    while (count < AI_LIMITS.perDay) {
      minute += 60_000;
      for (let i = 0; i < AI_LIMITS.perMinute && count < AI_LIMITS.perDay; i += 1, count += 1) expect(takeQuestion("member-b", new Date(minute))).toBe("ok");
    }
    expect(takeQuestion("member-b", new Date(minute + 60_000))).toBe("day");
    expect(takeQuestion("member-b", new Date("2026-11-23T10:00:00Z"))).toBe("ok");
  });

  it("cleans the conversation it is sent", () => {
    const turns = cleanTurns([{ role: "system", text: "x" }, { role: "user", text: "a\u0000b" }, "junk", { role: "assistant", text: "y".repeat(2000) }]);
    expect(turns).toEqual([
      { role: "user", text: "a b" },
      { role: "assistant", text: "y".repeat(AI_LIMITS.questionChars) },
    ]);
    expect(cleanTurns(Array.from({ length: 40 }, () => ({ role: "user", text: "q" }))).length).toBe(AI_LIMITS.turns);
  });
});
