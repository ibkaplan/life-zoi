import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="page card" role="status">Loading lifeZoi…</p>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
