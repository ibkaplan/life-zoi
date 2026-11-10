import type { NavLink } from "@/lib/navigation";
import type { Messages } from "./messages";

/** The menu label for a link in the current language, or its English label for a page added later. */
export function navLabel(m: Messages, link: Pick<NavLink, "href" | "label">): string {
  return (m.nav as Record<string, string>)[link.href] ?? link.label;
}
