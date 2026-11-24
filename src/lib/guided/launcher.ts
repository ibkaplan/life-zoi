/**
 * Starts a guided session from anywhere, including code outside React (for
 * example a voice command such as "Start Pilates"). The guided-session player
 * in the root layout listens for this event and opens the session.
 *
 * Call it from a tap or a voice command handler. With `start`, the voice
 * begins at once; phones only allow that when the call follows a tap.
 */
export const GUIDED_START_EVENT = "lifezoi:guided-start";

export type GuidedStartDetail = { id: string; start: boolean };

/**
 * Returns true when the player took the session. The event is cancelable and
 * the player calls `preventDefault()` when it accepts the id, so code that
 * fires the event itself can tell: `dispatchEvent` then returns false.
 */
export function requestGuidedSession(id: string, options: { start?: boolean } = {}): boolean {
  if (typeof window === "undefined") return false;
  const event = new CustomEvent<GuidedStartDetail>(GUIDED_START_EVENT, { detail: { id, start: options.start !== false }, cancelable: true });
  return !window.dispatchEvent(event);
}
