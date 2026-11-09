import type { Metadata } from "next";
import { Caveat, Fraunces, Source_Sans_3 } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
});

/** Handwritten accent, used only for short inspirational lines and brand statements. */
const script = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-script-family",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans-family",
});

export const metadata: Metadata = {
  title: {
    default: "lifeZoi",
    template: "%s · lifeZoi",
  },
  description:
    "lifeZoi helps you reflect on everyday habits, explore what-if lifestyle changes, and track wellness progress. Educational guidance, not medical advice.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${script.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
