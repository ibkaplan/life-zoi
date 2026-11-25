import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Noto_Serif, Source_Sans_3 } from "next/font/google";
import { AppearanceSync } from "@/components/appearance";
import { BackgroundMusicProvider } from "@/components/background-music/provider";
import { LocaleProvider } from "@/components/locale-provider";
import { SkipLink, TitleSync } from "@/components/localized-text";
import { SessionProvider } from "@/components/session-provider";
import { VoiceRouteGuard } from "@/components/voice/voice-route-guard";
import { GuidedProvider } from "@/components/guided/guided-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { LOOK_BOOT_SCRIPT } from "@/lib/appearance";
import { LOCALE_BOOT_SCRIPT } from "@/lib/i18n/boot-script";
import { APP_NAME, THEME_COLOR } from "@/lib/pwa/config";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
});

/**
 * Fraunces has no Cyrillic or Greek letters. Ukrainian, Russian, and Greek pages use this
 * open-licence serif for headings instead (see `:lang()` rules in globals.css).
 * Noto Serif (not Noto Serif Display) since 2026-11-25: its thin strokes are heavier, so
 * Cyrillic and Greek headings read as clearly as the English ones.
 */
const displayIntl = Noto_Serif({
  subsets: ["cyrillic", "greek", "latin"],
  variable: "--font-display-intl-family",
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
  applicationName: APP_NAME,
  // The manifest is linked automatically from src/app/manifest.ts.
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${displayIntl.variable} ${sans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOOK_BOOT_SCRIPT }} />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <LocaleProvider>
          <SkipLink />
          <TitleSync />
          <ServiceWorkerRegister />
          <Suspense fallback={null}>
            <VoiceRouteGuard />
          </Suspense>
          <BackgroundMusicProvider>
            <SessionProvider>
              <AppearanceSync />
              <GuidedProvider>{children}</GuidedProvider>
            </SessionProvider>
          </BackgroundMusicProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
