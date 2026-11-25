import type { Metadata } from "next";
import { BlogIndexView } from "@/components/blog/blog-views";
import { SITE_ORIGIN } from "@/lib/site";

const DESCRIPTION =
  "Short, calm health tips about movement, sleep, food, stress, and connection, each linked to public health guidance. General wellness education, not medical advice.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Health tips",
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/blog`,
    siteName: "lifeZoi",
    title: "Health tips · lifeZoi",
    description: DESCRIPTION,
    images: [{ url: "/home/hero-meadow.webp", width: 1600, height: 1200 }],
  },
  twitter: { card: "summary_large_image", title: "Health tips · lifeZoi", description: DESCRIPTION },
};

/** Public Health tips: a visitor can read these without an account. */
export default function BlogPage() {
  return <BlogIndexView />;
}
