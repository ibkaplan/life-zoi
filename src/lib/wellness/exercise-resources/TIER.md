# Exercise resource tier

Every guide, routine, video link, and category in this folder ships free.

`OFFERED_TIER` in `copy.ts` is `"free"`. `isOffered` returns true only for `"free"`.
Each item also has `tier: "free"`.

A later premium tier can be added without new routes:

1. Set that item's `tier` to `"premium"`.
2. Update `isOffered` when a real entitlement exists.
3. Keep the same slugs and pages.

Do not add billing, a checkout, or a paid download system in this folder.
Do not hide the guides that are already free.
