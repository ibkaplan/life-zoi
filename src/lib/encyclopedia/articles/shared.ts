/** Values every built-in article shares. */
export const SEED_DATE = "2026-11-22";

/**
 * Built-in articles were drafted with AI assistance from the sources each one cites,
 * and checked against those sources. None has been reviewed by a clinician yet,
 * so none carries a `review` and every page says so.
 */
export const SEED_AUTHOR = "LifeZoi editorial draft, written with AI assistance from the cited sources";

export const NCCIH = "National Center for Complementary and Integrative Health (NIH)";
export const NCI = "National Cancer Institute (NIH)";
export const WHO = "World Health Organization";
export const NOBEL = "The Nobel Prize (Nobel Prize Outreach)";
export const FDA = "U.S. Food and Drug Administration";
export const PUBMED = "PubMed (National Library of Medicine)";

export const nobel = (field: "medicine" | "chemistry", year: number) => ({
  title: `Nobel Prize in ${field === "medicine" ? "Physiology or Medicine" : "Chemistry"} ${year}: summary`,
  publisher: NOBEL,
  url: `https://www.nobelprize.org/prizes/${field}/${year}/summary/`,
  date: String(year),
});
