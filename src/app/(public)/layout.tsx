import { PublicShell } from "@/components/public-shell";

/** Pages a visitor can open without signing in: sign-in, password reset, invitations, privacy. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
