import type { Metadata } from "next";
import { ShoppingView } from "@/components/food-plan/plan-ui";

export const metadata: Metadata = { title: "My Shopping List", description: "A grouped shopping list you can check, edit, print, or copy." };

export default function ShoppingPage() {
  return <ShoppingView />;
}
