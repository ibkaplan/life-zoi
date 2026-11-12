import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeView } from "@/components/home-view";
import { LoadingText } from "@/components/localized-text";
import { MemberGate } from "@/components/member-gate";

export const metadata: Metadata = {
  title: "My space",
};

/**
 * The members' home. A signed-in member who opens "/" is served this page by the
 * proxy while the address bar keeps "/". Visitors get the public landing page instead.
 */
export default function MemberHomePage() {
  return (
    <Suspense fallback={<p className="page card" role="status"><LoadingText /></p>}>
      <MemberGate>
        <HomeView />
      </MemberGate>
    </Suspense>
  );
}
