import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = {
  title: "My Profile",
  description: "The lifestyle details you chose to enter in lifeZoi.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
