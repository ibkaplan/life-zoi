/** Search-engine details for the free tools: canonical address and schema.org structured data. */
export const SITE_URL = "https://www.lifezoi.com";

export function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

/** schema.org data for one free calculator page: the web app itself and its breadcrumb. */
export function toolJsonLd(input: { path: string; name: string; description: string; about: string }) {
  const url = absolute(input.path);
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: input.name,
      description: input.description,
      url,
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      inLanguage: ["en", "uk", "ru", "el"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      about: { "@type": "Thing", name: input.about },
      publisher: { "@type": "Organization", name: "lifeZoi", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "lifeZoi", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Free tools", item: absolute("/free") },
        { "@type": "ListItem", position: 3, name: input.name, item: url },
      ],
    },
  ];
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so it cannot close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
