import type { Metadata } from "next";
import { CalorieCalculator } from "@/components/free/calorie-calculator";
import { JsonLd } from "@/components/free/json-ld";
import { toolJsonLd } from "@/lib/free/seo";

const title = "Daily calorie calculator";
const description = "Free daily calorie calculator: estimate the energy you use in a day from age, height, weight, and activity with the Mifflin–St Jeor equation. No sign-up, nothing saved. Not medical advice.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/free/calorie-calculator" },
  openGraph: { title, description, url: "/free/calorie-calculator" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd({ path: "/free/calorie-calculator", name: title, description, about: "Energy requirement" })} />
      <CalorieCalculator />
    </>
  );
}
