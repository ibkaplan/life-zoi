# Page backgrounds

Owner request, 2026-11-22: replace the plain light page background with a soft, light backdrop, bluish for men and pale blue and pink for women.

## What exists

- Settings has a **Page background** card with four choices: Automatic (default), Classic Ivory, Calm Blue, Soft Rose.
- Automatic uses only the sex the person chose in their own latest saved questionnaire (`tableSex`): male gives Calm Blue, female gives Soft Rose, any other answer, a skipped answer, sample data, or no questionnaire gives Classic Ivory. Nothing else is used to guess. Any person can pick any background.
- Classic Ivory is the original background, unchanged.
- The choice is kept in this browser only (`localStorage` key `lifezoi-look`). The look last shown is kept under `lifezoi-look-shown` so a small script in `<head>` paints it before React starts, with no flash.
- `<html data-look="blue|rose|ivory">` selects the CSS in `src/app/globals.css` (search for "Page backgrounds").

## Files

- `src/lib/appearance.ts`: looks, the Automatic rule, the boot script. Tested in `src/lib/appearance.test.ts`.
- `src/components/appearance.tsx`: the store, `AppearanceSync` (in the root layout), and the Settings card.

## Rules for changes

- The backdrop is CSS gradients and small inline SVG (waves, circles). No image downloads, no licensed images.
- Cards, text colours and buttons do not change, so text inside cards keeps its contrast.
- Tints behind text that sits directly on the backdrop were checked to keep ink, muted, royal, and teal text at 4.5:1 or more (WCAG AA). Keep the peak tint alphas at or below the current values when editing.
- Printing hides the decoration.
