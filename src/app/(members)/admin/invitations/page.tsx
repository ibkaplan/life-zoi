import type { Metadata } from "next";
import { AdminInvitationsView } from "@/components/admin-invitations-view";

export const metadata: Metadata = {
  title: "Invite members",
  description: "Administrator page for sending and revoking lifeZoi invitations.",
};

export default function AdminInvitationsPage() {
  return <AdminInvitationsView />;
}
