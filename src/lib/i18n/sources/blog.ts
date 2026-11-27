import { BLOG_ARTICLES, BLOG_VIDEOS } from "@/lib/blog/articles";

/**
 * Data from the "blog" area (Health tips) that pages show through `t(value)`.
 * Every text string here must have a translation in catalog/<locale>/blog.json.
 * Video titles and publishers stay in their original language, so only the notes are listed.
 */
const sources: unknown[] = [
  BLOG_ARTICLES.map((article) => [
    article.topic,
    article.title,
    article.summary,
    article.sections.map((section) => [section.heading, section.paragraphs]),
    article.tryThis,
    article.video?.note ?? [],
  ]),
  BLOG_VIDEOS.map((video) => video.note),
];
export default sources;
