import { jsonLdScript } from "@/lib/free/seo";

/** Structured data for search engines. Server-rendered; it holds no personal data. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />;
}
