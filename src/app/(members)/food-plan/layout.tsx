import { FoodFrame } from "@/components/food-plan/frame";

export default function FoodPlanLayout({ children }: { children: React.ReactNode }) {
  return <FoodFrame>{children}</FoodFrame>;
}
