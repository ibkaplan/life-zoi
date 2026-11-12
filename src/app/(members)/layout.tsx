import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { LoadingText } from "@/components/localized-text";
import { MemberGate } from "@/components/member-gate";

/** Every page in this group is for signed-in members only. MemberGate checks on the server. */
export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="page card" role="status"><LoadingText /></p>}>
      <MemberGate>
        <AppShell>{children}</AppShell>
      </MemberGate>
    </Suspense>
  );
}
