import type { Article } from "@/lib/encyclopedia/types";
import { bodyArticles } from "./body";
import { cancerArticles } from "./cancer";
import { fastingArticles } from "./fasting";
import { livingArticles } from "./living";
import { traditionArticles } from "./traditions";

/** Articles that ship with the app. An editor's saved version of the same slug replaces one. */
export const BUILT_IN_ARTICLES: readonly Article[] = [
  ...livingArticles.filter((article) => article.slug === "vaccines-sixty-years"),
  ...cancerArticles,
  ...fastingArticles,
  ...bodyArticles,
  ...livingArticles.filter((article) => article.slug !== "vaccines-sixty-years"),
  ...traditionArticles,
];
