import type { Metadata } from "next";
import { MiniCourses } from "@/components/courses/mini-courses";

export const metadata: Metadata = {
  title: "7-day mini-courses",
  description: "One short practice a day for a week: calm breathing, gentle movement, or rest and calm. Each day opens a practice already in LifeZoi. Go at your own pace.",
};

export default function CoursesPage() {
  return <MiniCourses variant="page" />;
}
