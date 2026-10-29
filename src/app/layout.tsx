import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
