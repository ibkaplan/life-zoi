import type { Metadata } from "next";
import { SignInView } from "@/components/sign-in-view";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your lifeZoi account.",
};

export default function SignInPage() {
  return <SignInView />;
}
