import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingText } from "@/components/localized-text";
import { SignInView } from "@/components/sign-in-view";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your lifeZoi account.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<p className="card" role="status"><LoadingText /></p>}>
      <SignInView />
    </Suspense>
  );
}
