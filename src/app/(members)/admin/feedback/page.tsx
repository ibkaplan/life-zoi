import type { Metadata } from "next";
import { AdminFeedbackView } from "@/components/feedback/admin-feedback-view";

export const metadata: Metadata = {
  title: "Review management",
  description: "Administrator page for reviews, suggestions, and announcements.",
};

export default function AdminFeedbackPage() {
  return <AdminFeedbackView />;
}
