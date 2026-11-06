import Link from "next/link";
import { HabitPicker, MissionCard, PracticeCalendar } from "@/components/library/session-tools";
import { LIBRARY_DISCLAIMER } from "@/lib/library/catalog";

export function PracticeView() {
  return (
    <div className="library stack-lg">
      <p className="kicker">Health Library</p>
      <h1>Daily practice</h1>
      <p className="lede">
        An optional mission, a habit you can pick, and a calendar that only marks days you recorded. Blank days stay blank.
      </p>
      <MissionCard />
      <PracticeCalendar />
      <HabitPicker />
      <p>
        <Link href="/habits">Open shared challenges</Link>
        {" · "}
        <Link href="/library/move">Movement checkoffs</Link>
      </p>
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
    </div>
  );
}
