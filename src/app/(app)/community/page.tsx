import type { Metadata } from "next";
import { CommunityView } from "@/components/community-view";

export const metadata: Metadata = {
  title: "Community",
  description: "A pseudonymous community. Messages are checked before they are public.",
};

export default function CommunityPage() {
  return <CommunityView />;
}
