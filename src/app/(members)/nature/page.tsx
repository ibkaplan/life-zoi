import type { Metadata } from "next";
import { NatureHome } from "@/components/wellness/nature-views";

export const metadata: Metadata = {
  title: "The power of nature",
  description: "Daylight, green space, and time outside as education. Nature is not medicine.",
};

export default function NaturePage() {
  return <NatureHome />;
}
