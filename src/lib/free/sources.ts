import { msg } from "@/lib/i18n/translate";

/** Published sources the free calculators copy their numbers from. Titles are the publishers' own. */
export type FreeSource = { title: string; publisher: string; href: string };

export const FREE_SOURCES = {
  mifflin: {
    title: "A new predictive equation for resting energy expenditure in healthy individuals (Mifflin MD, St Jeor ST, et al., 1990)",
    publisher: "The American Journal of Clinical Nutrition",
    href: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
  },
  nasemWater: {
    title: "Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate (2005)",
    publisher: "National Academies of Sciences, Engineering, and Medicine",
    href: "https://nap.nationalacademies.org/catalog/10925",
  },
  cdcWater: {
    title: "About Water and Healthier Drinks",
    publisher: "U.S. Centers for Disease Control and Prevention",
    href: "https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html",
  },
  cdcSleep: {
    title: "About Sleep",
    publisher: "U.S. Centers for Disease Control and Prevention",
    href: "https://www.cdc.gov/sleep/about/index.html",
  },
  nhlbiSleep: {
    title: "Healthy Sleep Habits",
    publisher: "U.S. National Heart, Lung, and Blood Institute",
    href: "https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits",
  },
  ahaBp: {
    title: "Understanding Blood Pressure Readings",
    publisher: "American Heart Association",
    href: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
  },
  ahaBpHome: {
    title: "Monitoring Your Blood Pressure at Home",
    publisher: "American Heart Association",
    href: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home",
  },
} satisfies Record<string, FreeSource>;

/** Shown on every free tool. */
export const FREE_NOTICE = msg(
  "General information for adults, not a diagnosis and not medical advice. Your doctor may set different targets for you. Nothing you type here is sent or saved: the calculation runs in your browser.",
);
