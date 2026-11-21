import type { Metadata } from "next";
import { AcceptInviteView } from "@/components/accept-invite-view";

export const metadata: Metadata = {
  title: "Accept your invitation",
  description: "Choose a password for the lifeZoi account you were invited to.",
};

export default function AcceptInvitePage() {
  return <AcceptInviteView />;
}
