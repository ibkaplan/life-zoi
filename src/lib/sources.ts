import type { Source } from "@/lib/types";

export const sources = {
  whoActivity: {
    name: "World Health Organization",
    title: "Physical activity",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
  },
  usActivityGuidelines: {
    name: "Office of Disease Prevention and Health Promotion",
    title: "Physical Activity Guidelines for Americans",
    url: "https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines",
  },
  nhlbiSleep: {
    name: "National Heart, Lung, and Blood Institute",
    title: "How much sleep is enough?",
    url: "https://www.nhlbi.nih.gov/health/sleep/how-much-sleep",
  },
  whoTobacco: {
    name: "World Health Organization",
    title: "Tobacco",
    url: "https://www.who.int/news-room/fact-sheets/detail/tobacco",
  },
  smokefree: {
    name: "National Cancer Institute",
    title: "Smokefree.gov",
    url: "https://smokefree.gov/",
  },
  dietaryGuidelines: {
    name: "Dietary Guidelines for Americans",
    title: "DietaryGuidelines.gov",
    url: "https://www.dietaryguidelines.gov/",
  },
  realFood: {
    name: "Dietary Guidelines for Americans",
    title: "RealFood.gov",
    url: "https://realfood.gov/",
  },
  nutritionWater: {
    name: "Nutrition.gov",
    title: "Water, hydration, and health",
    url: "https://www.nutrition.gov/topics/basic-nutrition/water-hydration-and-health",
  },
  niaaa: {
    name: "National Institute on Alcohol Abuse and Alcoholism",
    title: "Alcohol's effects on health",
    url: "https://www.niaaa.nih.gov/alcohols-effects-health",
  },
  nimhStress: {
    name: "National Institute of Mental Health",
    title: "I'm So Stressed Out! Fact Sheet",
    url: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet",
  },
  whoConnection: {
    name: "World Health Organization",
    title: "Social isolation and loneliness",
    url: "https://www.who.int/teams/social-determinants-of-health/demographic-change-and-healthy-ageing/social-isolation-and-loneliness",
  },
  samhsa988: {
    name: "Substance Abuse and Mental Health Services Administration",
    title: "988 Suicide & Crisis Lifeline",
    url: "https://www.samhsa.gov/mental-health/988",
  },
} as const satisfies Record<string, Source>;

export const PROFESSIONAL_NOTICE =
  "lifeZoi offers general wellness education. It does not diagnose conditions, recommend changing prescription medication, or predict how long you will live. Talk with a qualified clinician about personal medical decisions.";

export const CRISIS_NOTICE =
  "If you are in immediate distress in the United States, call or text 988. SAMHSA describes the 988 Suicide & Crisis Lifeline.";
