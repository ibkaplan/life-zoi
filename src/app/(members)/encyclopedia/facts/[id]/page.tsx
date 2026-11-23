import type { Metadata } from "next";
import { FactPage } from "@/components/encyclopedia/facts-view";
import { findFact } from "@/lib/encyclopedia/facts";

export async function generateMetadata({ params }: PageProps<"/encyclopedia/facts/[id]">): Promise<Metadata> {
  const { id } = await params;
  const fact = findFact(id);
  return { title: fact?.headline ?? "Did You Know?", description: fact?.fact ?? "A LifeZoi health fact." };
}

export default async function Page({ params }: PageProps<"/encyclopedia/facts/[id]">) {
  const { id } = await params;
  return <FactPage id={id} />;
}
