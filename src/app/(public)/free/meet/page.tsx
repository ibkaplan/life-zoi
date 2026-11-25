import type { Metadata } from "next";
import { MeetDemo } from "@/components/meet-demo/meet-demo";
import { MEET_DEMO } from "@/lib/meet-demo/script";

export const metadata: Metadata = {
  title: "Meet LifeZoi",
  description: MEET_DEMO.en.metaDescription,
  openGraph: {
    title: "Meet LifeZoi",
    description: MEET_DEMO.en.metaDescription,
    images: ["/home/hero-meadow.webp"],
  },
};

/** Public voice demo: a scripted conversation with the LifeZoi voice companion. No account needed. */
export default function MeetLifeZoiPage() {
  return <MeetDemo />;
}
