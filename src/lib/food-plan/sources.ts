import { msg } from "@/lib/i18n/translate";

export const FOOD_LINKS = {
  harvardPlate: {
    name: "Harvard Healthy Eating Plate",
    url: "https://nutritionsource.hsph.harvard.edu/what-should-you-eat/",
  },
  harvardProtein: {
    name: "Harvard: Protein",
    url: "https://nutritionsource.hsph.harvard.edu/what-should-you-eat/protein/",
  },
  harvardCheese: {
    name: "Harvard: Cheese",
    url: "https://nutritionsource.hsph.harvard.edu/cheese/",
  },
  myplate: { name: "USDA MyPlate", url: "https://www.myplate.gov/" },
  nih: { name: "NIH NIDDK: Diet and nutrition", url: "https://www.niddk.nih.gov/health-information/diet-nutrition" },
  cdc: { name: "CDC: About nutrition", url: "https://www.cdc.gov/nutrition/php/about/index.html" },
  fda: {
    name: "FDA: How to understand the Nutrition Facts label",
    url: "https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label",
  },
  nhs: { name: "NHS: Eat well", url: "https://www.nhs.uk/live-well/eat-well/" },
  nccih: {
    name: "NCCIH: Ayurvedic medicine",
    url: "https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth",
  },
  heartProtein: {
    name: "American Heart Association: Picking healthy proteins",
    url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/picking-healthy-proteins",
  },
  proteinReview: {
    name: msg("Published article on protein intakes"),
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13665703/",
  },
  pubmedProtein: {
    name: msg("PubMed record 39002131"),
    url: "https://pubmed.ncbi.nlm.nih.gov/39002131/",
  },
  unhHarvest: {
    name: "UNH Extension: New Hampshire harvest season chart",
    url: "https://extension.unh.edu/sites/default/files/migrated_unmanaged_files/Resource000581_Rep603.pdf",
  },
  massGrown: {
    name: "Massachusetts-grown produce availability calendar",
    url: "https://www.mass.gov/doc/produce-availability-chart/download",
  },
  fdc: { name: "USDA FoodData Central", url: "https://fdc.nal.usda.gov/" },
} as const;

export const FOOD_TITLE = msg("LIFEZOI — MY PERSONAL FOOD & WELLNESS PLAN");
export const FOOD_SUBTITLE = msg("Discover Seasonal Foods. Explore Ayurveda. Build a Balanced Way of Eating.");
export const FOOD_TAGLINE = msg("Eat Well. Follow the Seasons. Feel Your Best.");
export const SIMPLE_MESSAGE = msg(
  "You don't need complicated recipes to eat well. Build simple meals with protein, vegetables, fiber, and foods you enjoy.",
);

export const PROFESSIONAL_FOOD = msg(
  "LifeZoi is educational. It does not diagnose, prescribe, or replace a clinician or registered dietitian. Modern public nutrition guidance comes before traditional ideas when they conflict.",
);

export const DOSHA_NOTICE = msg(
  "Doshas are traditional descriptions. They are not medically validated biological classes. LifeZoi does not assign or diagnose a dosha, and it does not use weight or a medical condition to do so.",
);

export const AYURVEDA_LIMIT = msg(
  "Ayurveda is traditional inspiration for flavor and meal style only. It is not a treatment, a detox, or a reason to remove a food group. No supplements are suggested.",
);
