import type { Metadata } from "next";
import { SITE_URL } from "@/lib/free/seo";

/**
 * Free tools anyone can open without an account (src/lib/free/hub.ts).
 * Search indexing still follows the root layout's `noindex` until the owner
 * lifts it; the titles, descriptions, canonical links, and structured data
 * here are ready for when that happens.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: "lifeZoi", type: "website" },
};

export default function FreeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
