import type { Metadata } from "next";
import { BooksView } from "@/components/companion/books-view";

export const metadata: Metadata = {
  title: "Books and listening",
  description: "Short stories and gentle guides written for LifeZoi, to read or listen to, with bookmarks.",
};

export default function BooksPage() {
  return <BooksView />;
}
