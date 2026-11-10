import type { Metadata } from "next";
import { Caveat, Fraunces, Noto_Serif_Display, Source_Sans_3 } from "next/font/google";
import { BackgroundMusicProvider } from "@/components/background-music/provider";
import { LocaleProvider } from "@/components/locale-provider";
import { SkipLink, TitleSync } from "@/components/localized-text";
import { SessionProvider } from "@/components/session-provider";
import { LOCALE_BOOT_SCRIPT } from "@/lib/i18n/boot-script";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
});

/**
 * Fraunces has no Cyrillic or Greek letters. Ukrainian, Russian, and Greek pages use this
 * open-licence serif for headings instead (see `:lang()` rules in globals.css).
 */
const displayIntl = Noto_Serif_Display({
  subsets: ["cyrillic", "greek", "latin"],
  variable: "--font-display-intl-family",
});

/** Handwritten accent, used only for short inspirational lines and brand statements. */
const script = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
  variable: "--font-script-family",
});

const sans = Source_Sans_3({
  subsets: ["latin", "cyrillic", "greek"],
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${displayIntl.variable} ${sans.variable} ${script.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT_SCRIPT }} />
      </head>
      <body>
        <LocaleProvider>
          <SkipLink />
          <TitleSync />
          <BackgroundMusicProvider>
            <SessionProvider>{children}</SessionProvider>
          </BackgroundMusicProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
