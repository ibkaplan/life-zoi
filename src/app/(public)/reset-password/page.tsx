import type { Metadata } from "next";
import { ResetPasswordView } from "@/components/reset-password-view";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password after opening a lifeZoi reset link.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
