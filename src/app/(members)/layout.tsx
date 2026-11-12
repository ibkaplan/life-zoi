import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { LoadingText } from "@/components/localized-text";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="page card" role="status"><LoadingText /></p>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
