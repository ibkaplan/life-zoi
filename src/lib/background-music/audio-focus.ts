/**
 * Audio focus: any part of LifeZoi that makes its own sound (a yoga video,
 * guided breathing, spoken instructions, the music library) claims focus, and
 * background music pauses until every claim is released.
 *
 * This is an in-page signal only. It never inspects what the other audio is.
 */
export type FocusKind = "sound" | "video";

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
