/**
 * Audio focus: any part of LifeZoi that makes its own sound claims focus while
 * it plays. The music player reads the claims (see `sessionEffect` in `prefs.ts`):
 * - `video`: an exercise video is on screen. Music plays quietly underneath, or pauses.
 * - `voice`: spoken instructions (read aloud, guided breathing, a timer's voice).
 *   Music plays quietly underneath, or pauses.
 * - `sound`: another tune or player. Music pauses until it ends.
 *
 * Any new feature that speaks or plays sound (for example a focus timer) should
 * claim focus with `useAudioFocus` from `src/components/background-music/use-audio-focus.ts`.
 *
 * This is an in-page signal only. It never inspects what the other audio is.
 */
export type FocusKind = "sound" | "video" | "voice";

type Claim = { id: string; kind: FocusKind };
type Listener = (claims: readonly Claim[]) => void;

export function createAudioFocus() {
  let claims: Claim[] = [];
  const listeners = new Set<Listener>();
  const emit = () => {
    for (const listener of listeners) listener(claims);
  };
  return {
    claim(id: string, kind: FocusKind = "sound") {
      if (claims.some((item) => item.id === id)) return;
      claims = [...claims, { id, kind }];
      emit();
    },
    release(id: string) {
      if (!claims.some((item) => item.id === id)) return;
      claims = claims.filter((item) => item.id !== id);
      emit();
    },
    claims(): readonly Claim[] {
      return claims;
    },
    busy(): boolean {
      return claims.length > 0;
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type AudioFocus = ReturnType<typeof createAudioFocus>;

/** One shared instance for the page. */
export const audioFocus: AudioFocus = createAudioFocus();
