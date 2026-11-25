import type { Metadata } from "next";
import { BloodPressureCheck } from "@/components/free/blood-pressure-check";
import { JsonLd } from "@/components/free/json-ld";
import { toolJsonLd } from "@/lib/free/seo";

const title = "Blood pressure ranges";
const description = "Free blood pressure range check: see which American Heart Association category a reading falls in, with safety notes and tips for measuring at home. Not a diagnosis.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/free/blood-pressure" },
  openGraph: { title, description, url: "/free/blood-pressure" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd({ path: "/free/blood-pressure", name: title, description, about: "Blood pressure" })} />
      <BloodPressureCheck />
    </>
  );
}
