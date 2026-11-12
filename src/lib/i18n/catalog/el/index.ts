// One file per area of the app, so translations of different areas can be edited separately.
import core from "./core.json";
import pages from "./pages.json";
import nutrition from "./nutrition.json";
import wellness_challenges from "./wellness-challenges.json";
import wellness_academy from "./wellness-academy.json";
import wellness_urges from "./wellness-urges.json";
import brain from "./brain.json";
import library from "./library.json";
import companion from "./companion.json";
import habits from "./habits.json";
import focus from "./focus.json";
import assistant from "./assistant.json";

const catalog: Record<string, string> = { ...core, ...pages, ...nutrition, ...wellness_challenges, ...wellness_academy, ...wellness_urges, ...brain, ...library, ...companion, ...habits, ...focus, ...assistant };
export default catalog;
