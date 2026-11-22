import type { Metadata } from "next";
import { FeedbackHome } from "@/components/feedback/feedback-home";

export const metadata: Metadata = {
  title: "Reviews & Feedback",
  description: "Rate LifeZoi, share what you like and what to improve, and suggest new features.",
};

export default function FeedbackPage() {
  return <FeedbackHome />;
}
