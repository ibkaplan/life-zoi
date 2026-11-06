import type { Metadata } from "next";
import { MyDayView } from "@/components/my-day-view";

export const metadata: Metadata = {
  title: "My Day at LifeZoi",
  description: "A local day plan with progress from activities you mark done. Educational only. Not a diagnosis.",
};

export default function MyDayPage() {
  return <MyDayView />;
}
