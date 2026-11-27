import type { Metadata } from "next";
import { SleepCalculator } from "@/components/free/sleep-calculator";
import { JsonLd } from "@/components/free/json-ld";
import { toolJsonLd } from "@/lib/free/seo";

const title = "Sleep and bedtime calculator";
const description = "Free sleep calculator: the hours of sleep the CDC recommends for your age and the bedtime that fits your wake-up time. No sign-up, nothing saved.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/free/sleep-calculator" },
  openGraph: { title, description, url: "/free/sleep-calculator" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd({ path: "/free/sleep-calculator", name: title, description, about: "Sleep" })} />
      <SleepCalculator />
    </>
  );
}
