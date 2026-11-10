/**
 * Audio focus: any part of LifeZoi that makes its own sound (a yoga video,
 * guided breathing, spoken instructions, the music library) claims focus, and
 * background music pauses until every claim is released.
 *
 * A `voice` claim (the read-aloud voice) does not pause music: the music gets
 * quieter instead, so the voice stays clear over it.
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
    /** Sound that music should pause for. */
    busy(): boolean {
      return claims.some((item) => item.kind !== "voice");
    },
    /** A voice is speaking, so music should play quietly underneath. */
    ducked(): boolean {
      return claims.some((item) => item.kind === "voice");
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
