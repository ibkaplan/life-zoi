import type { Metadata } from "next";
import { ProfileForm } from "@/components/food-plan/plan-ui";

export const metadata: Metadata = {
  title: "Discover My Food Profile",
  description: "Optional food questions. Weight loss is not assumed.",
};

export default function ProfileRoute() {
  return <ProfileForm />;
}
