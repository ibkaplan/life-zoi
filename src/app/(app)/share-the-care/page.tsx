import type { Metadata } from "next";
import { ShareCareView } from "@/components/share-care-view";
import { isProductionSite } from "@/lib/share-care";

export const metadata: Metadata = {
  title: "Share the Care",
  description: "Invite someone you love to discover LifeZoi. A little care can make a big difference.",
};

export default function ShareTheCarePage() {
  return (
    <ShareCareView
      productionSite={isProductionSite({
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
      })}
    />
  );
}
