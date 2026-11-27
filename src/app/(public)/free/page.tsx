import type { Metadata } from "next";
import { FreeHub } from "@/components/free/free-hub";
import { JsonLd } from "@/components/free/json-ld";
import { FREE_HUB } from "@/lib/free/hub";
import { absolute } from "@/lib/free/seo";

const description =
  "Free health calculators from lifeZoi: daily calories, water intake, sleep and bedtime, and blood pressure ranges. No sign-up, nothing saved, sources shown. Not medical advice.";

export const metadata: Metadata = {
  title: "Free health tools",
  description,
  alternates: { canonical: "/free" },
  openGraph: { title: "Free health tools", description, url: "/free" },
};

export default function FreeHubPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Free health tools",
          description,
          url: absolute("/free"),
          isAccessibleForFree: true,
          hasPart: FREE_HUB.map((entry) => ({ "@type": "WebPage", name: entry.title, url: absolute(entry.href) })),
        }}
      />
      <FreeHub />
    </>
  );
}
