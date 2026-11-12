import type { Metadata } from "next";
import { ChairYogaStudioView } from "@/components/companion/chair-yoga-studio";

export const metadata: Metadata = {
  title: "Chair Yoga Studio",
  description: "Free seated and standing chair yoga, and gentle yoga and mobility classes, played with YouTube's official player inside LifeZoi.",
};

export default function ChairYogaStudioPage() {
  return <ChairYogaStudioView />;
}
