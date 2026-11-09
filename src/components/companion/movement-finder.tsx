"use client";

import { useState } from "react";
import { ActivityActions, FavoriteButton, RatingControl, SessionPlayer, VideoPlayer } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { commitCompanion } from "@/lib/companion/store";
import { FITNESS_LEVELS, EXPERIENCE, type ActivityKind, type FitnessLevel, type Experience } from "@/lib/companion/state";
import { DURATION_OPTIONS, HOME_CHOICES, INDOOR_CHOICES, recommend } from "@/lib/wellness-library/discover";
import { CATEGORY_INFO, type LibraryCategory } from "@/lib/wellness-library/moves";

const KIND_FOR: Partial<Record<LibraryCategory, ActivityKind>> = {
  pilates: "pilates",
  yoga: "yoga",
  aerobics: "aerobics",
  dance: "dancing",
  "home-cardio": "home-cardio",
  strength: "strength",
  chair: "chair-exercises",
  stretching: "stretching",
  "tai-chi": "tai-chi",
  qigong: "qigong",
  balance: "balance",
  breathing: "breathing",
  meditation: "meditation",
};

export function categoryForKind(kind: ActivityKind): LibraryCategory | null {
  const found = (Object.entries(KIND_FOR) as [LibraryCategory, ActivityKind][]).find(([, value]) => value === kind);
  return found ? found[0] : kind === "chair-yoga" ? "chair" : kind === "relaxation" ? "breathing" : null;
}

/**
 * Pick an activity and a duration, then play it here.
 * Used on the Movement library page, the improvement plan, and My Day.
 */
export function MovementFinder({
  activityId,
  initialCategory,
  choices = HOME_CHOICES,
  heading,
  intro,
  compact = false,
}: {
  activityId: string;
  initialCategory?: LibraryCategory;
  choices?: LibraryCategory[];
  heading?: string;
  intro?: string;
  compact?: boolean;
}) {
  const { ready, mover, companion, sample } = useProfile();
  const enjoyed = companion.movement.enjoyed.map(categoryForKind).find((value): value is LibraryCategory => value !== null && choices.includes(value));
  const [category, setCategory] = useState<LibraryCategory>(initialCategory ?? enjoyed ?? choices[0] ?? "chair");
  const [minutes, setMinutes] = useState<number>(companion.movement.minutes);
  const [harder, setHarder] = useState(false);
  const [open, setOpen] = useState(false);
  if (!ready) return <p className="hint">Loading…</p>;
  const rec = recommend({ category, minutes, harder }, mover);
  const main = rec.main;
  return (
    <div className="stack">
      {heading ? <h3>{heading}</h3> : null}
      {intro ? <p>{intro}</p> : null}
      <div className="lz-tabs" role="group" aria-label="Activity">
        {choices.map((value) => (
          <button
            key={value}
            type="button"
            className="lz-tab"
            aria-pressed={value === category}
            onClick={() => {
              setCategory(value);
              setOpen(false);
            }}
          >
            {CATEGORY_INFO[value].title}
          </button>
        ))}
      </div>
      <div className="lz-tabs" role="group" aria-label="How many minutes">
        {DURATION_OPTIONS.map((value) => (
          <button key={value} type="button" className="lz-tab" aria-pressed={value === minutes} onClick={() => setMinutes(value)}>
            {value} min
          </button>
        ))}
      </div>
      <label className="check-row">
        <input type="checkbox" checked={harder} onChange={(event) => setHarder(event.target.checked)} />
        <span>Make it a bit more challenging today</span>
      </label>
      {!open ? (
        <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
          Show my {minutes}-minute {CATEGORY_INFO[category].title.toLowerCase()} session
        </button>
      ) : (
        <div className="lz-card">
          <h3>{rec.headline}</h3>
          {rec.notes.length > 0 ? (
            <ul className="hint">
              {rec.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          {main.kind === "video" ? (
            <>
              <p>
                <strong>{main.video.title}</strong>
              </p>
              <p>{main.video.description}</p>
              <VideoPlayer video={main.video} />
              <RatingControl id={`video:${main.video.id}`} />
              <FavoriteButton id={`video:${main.video.id}`} label="this video" />
            </>
          ) : (
            <>
              <p>
                <strong>{main.session.title}</strong> · {main.session.sourceName}
              </p>
              <SessionPlayer session={main.session} />
              <FavoriteButton id={`session:${category}:${minutes}`} label="this session" />
            </>
          )}
          {!sample ? (
            <ActivityActions
              activityId={activityId}
              minutes={minutes}
              counts={(status) => ({ exerciseMinutes: status === "done" ? minutes : status === "partial" ? Math.round(minutes / 2) : 0 })}
            />
          ) : (
            <p className="hint">Sample data is on, so nothing is recorded.</p>
          )}
          {rec.alternatives.length > 0 ? (
            <details>
              <summary>Alternative sessions ({rec.alternatives.length})</summary>
              <div className="stack">
                {rec.alternatives.map((alt) =>
                  alt.kind === "video" ? (
                    <div key={alt.video.id} className="lz-card">
                      <strong>{alt.video.title}</strong>
                      <p className="hint">{alt.note}</p>
                      <VideoPlayer video={alt.video} />
                    </div>
                  ) : (
                    <div key={alt.session.id} className="lz-card">
                      <strong>{alt.session.title}</strong>
                      <p className="hint">{alt.note}</p>
                      <SessionPlayer session={alt.session} />
                    </div>
                  ),
                )}
              </div>
            </details>
          ) : null}
        </div>
      )}
      {!compact ? <MovementPreferences /> : null}
    </div>
  );
}

const ENJOY_CHOICES: ActivityKind[] = [
  "walking",
  "pilates",
  "yoga",
  "chair-yoga",
  "chair-exercises",
  "tai-chi",
  "qigong",
  "dancing",
  "aerobics",
  "stretching",
  "strength",
  "balance",
  "breathing",
  "relaxation",
  "gardening",
];

const KIND_LABEL: Record<ActivityKind, string> = {
  walking: "Walking",
  pilates: "Pilates",
  yoga: "Yoga",
  "chair-yoga": "Chair yoga",
  "chair-exercises": "Chair exercises",
  "tai-chi": "Tai chi",
  qigong: "Qigong",
  dancing: "Dancing",
  aerobics: "Aerobics",
  "home-cardio": "Home cardio",
  stretching: "Stretching",
  strength: "Strength training",
  balance: "Balance exercises",
  breathing: "Breathing exercises",
  relaxation: "Relaxation",
  meditation: "Meditation",
  gardening: "Gardening",
};

export function activityLabel(kind: ActivityKind): string {
  return KIND_LABEL[kind];
}

/** Which activities the person enjoys, their level, and usual time. Editable any time. */
export function MovementPreferences() {
  const { companion, sample } = useProfile();
  const prefs = companion.movement;
  function save(patch: Partial<typeof prefs>) {
    commitCompanion((state) => ({ ...state, movement: { ...state.movement, ...patch } }));
  }
  return (
    <details className="lz-section">
      <summary>
        <span>My movement preferences</span>
      </summary>
      <div className="lz-section-body">
        {sample ? <p className="hint">Sample data is on. Preferences are not saved.</p> : null}
        <fieldset className="field">
          <legend>Which activities do you enjoy?</legend>
          <div className="check-grid">
            {ENJOY_CHOICES.map((kind) => (
              <label key={kind} className="check-row">
                <input
                  type="checkbox"
                  checked={prefs.enjoyed.includes(kind)}
                  onChange={(event) =>
                    save({
                      enjoyed: event.target.checked ? [...prefs.enjoyed, kind] : prefs.enjoyed.filter((item) => item !== kind),
                      disliked: prefs.disliked.filter((item) => item !== kind),
                    })
                  }
                />
                <span>{KIND_LABEL[kind]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>Anything you would rather not do?</legend>
          <div className="check-grid">
            {ENJOY_CHOICES.map((kind) => (
              <label key={kind} className="check-row">
                <input
                  type="checkbox"
                  checked={prefs.disliked.includes(kind)}
                  onChange={(event) =>
                    save({
                      disliked: event.target.checked ? [...prefs.disliked, kind] : prefs.disliked.filter((item) => item !== kind),
                      enjoyed: prefs.enjoyed.filter((item) => item !== kind),
                    })
                  }
                />
                <span>{KIND_LABEL[kind]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>Your current fitness level</span>
          <span className="hint">LifeZoi uses this, your experience, and any limits you reported. Age alone never sets the level.</span>
          <select value={prefs.level} onChange={(event) => save({ level: event.target.value as FitnessLevel | "" })}>
            <option value="">Not sure</option>
            {FITNESS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level[0]?.toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Exercise experience</span>
          <select value={prefs.experience} onChange={(event) => save({ experience: event.target.value as Experience | "" })}>
            <option value="">Not sure</option>
            {EXPERIENCE.map((value) => (
              <option key={value} value={value}>
                {value === "new" ? "New to exercise" : value === "some" ? "Some experience" : "I exercise regularly"}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Usual session length</span>
          <select value={prefs.minutes} onChange={(event) => save({ minutes: Number(event.target.value) as typeof prefs.minutes })}>
            {DURATION_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} minutes
              </option>
            ))}
          </select>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={prefs.wantsChallenge} onChange={(event) => save({ wantsChallenge: event.target.checked })} />
          <span>I would like my sessions to be more challenging</span>
        </label>
      </div>
    </details>
  );
}

/** Shown when the person says no to an outdoor walk. */
export function IndoorAlternative({ activityId }: { activityId: string }) {
  return (
    <div className="lz-card" role="region" aria-label="Indoor alternatives">
      <h3>No problem! Let&apos;s exercise at home today.</h3>
      <p>What type of activity would you enjoy? Choose one and how long you have.</p>
      <MovementFinder activityId={activityId} choices={[...INDOOR_CHOICES, "tai-chi", "qigong", "breathing"]} compact />
    </div>
  );
}
