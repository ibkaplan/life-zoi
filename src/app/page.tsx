import { LandingView } from "@/components/landing-view";

/**
 * The public landing page: logo, introductory image, short description, Log in,
 * and how to join by invitation. A signed-in member is served the members' home
 * here instead (see src/proxy.ts).
 */
export default function LandingPage() {
  return <LandingView />;
}
