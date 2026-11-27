import type { Metadata } from "next";
import { FriendsView } from "@/components/friends/friends-view";
import { isProductionSite } from "@/lib/share-care";

export const metadata: Metadata = {
  title: "Invite a friend",
  description: "Your personal invite link, the 7-day Together challenge, and badges for you and your friend.",
};

export default function FriendsPage() {
  return (
    <FriendsView
      productionSite={isProductionSite({
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
      })}
    />
  );
}
