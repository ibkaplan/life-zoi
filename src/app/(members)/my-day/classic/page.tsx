import type { Metadata } from "next";
import { MyDayView } from "@/components/my-day-view";

export const metadata: Metadata = {
  title: "My Day classic",
  description: "The earlier My Day tracker with progress from activities you mark done. Educational only. Not a diagnosis.",
};

export default function MyDayClassicPage() {
  return <MyDayView />;
}
