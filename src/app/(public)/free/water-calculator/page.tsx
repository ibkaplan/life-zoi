import type { Metadata } from "next";
import { WaterCalculator } from "@/components/free/water-calculator";
import { JsonLd } from "@/components/free/json-ld";
import { toolJsonLd } from "@/lib/free/seo";

const title = "Water intake guide";
const description = "How much water should an adult drink a day? Free guide to the U.S. National Academies amounts for women, men, pregnancy, and breastfeeding, in litres and glasses. No sign-up.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/free/water-calculator" },
  openGraph: { title, description, url: "/free/water-calculator" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd({ path: "/free/water-calculator", name: title, description, about: "Drinking water" })} />
      <WaterCalculator />
    </>
  );
}
