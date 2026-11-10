"use client";

import { useMessages } from "@/components/locale-provider";

/** Small translated pieces that server components can place in their markup. */
export function LoadingText() {
  return <>{useMessages().common.loading}</>;
}

export function SkipLink() {
  return (
    <a className="skip" href="#main">
      {useMessages().shell.skip}
    </a>
  );
}
