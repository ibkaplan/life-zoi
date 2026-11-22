import type { Metadata } from "next";
import { MembersSayView } from "@/components/feedback/members-say-view";

export const metadata: Metadata = {
  title: "What our members say",
  description: "Genuine published reviews from LifeZoi members, with the average rating.",
};

export default function MembersSayPage() {
  return <MembersSayView />;
}
