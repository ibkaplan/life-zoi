export const sources = {
  cdcSleep: {
    id: "cdc-sleep",
    title: "About Sleep",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/sleep/about/index.html",
  },
  cdcSleepHeart: {
    id: "cdc-sleep-heart",
    title: "About Sleep and Your Heart Health",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/heart-disease/about/sleep-and-heart-health.html",
  },
  cdcActivity: {
    id: "cdc-activity",
    title: "Adult Activity: An Overview",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
  },
  cdcAddingActivity: {
    id: "cdc-adding-activity",
    title: "Adding Physical Activity as an Adult",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/physical-activity-basics/adding-adults/index.html",
  },
  whoActivity: {
    id: "who-activity",
    title: "Physical activity",
    publisher: "World Health Organization",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
  },
  cdcQuit: {
    id: "cdc-quit",
    title: "Benefits of Quitting Smoking",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/tobacco/about/benefits-of-quitting.html",
  },
  smokefree: {
    id: "smokefree",
    title: "Smokefree.gov",
    publisher: "National Cancer Institute",
    url: "https://smokefree.gov/",
  },
  myplate: {
    id: "myplate",
    title: "MyPlate",
    publisher: "U.S. Department of Agriculture",
    url: "https://www.myplate.gov/",
  },
  dietaryGuidelines: {
    id: "dietary-guidelines",
    title: "Dietary Guidelines for Americans",
    publisher: "U.S. Department of Agriculture and U.S. Department of Health and Human Services",
    url: "https://www.dietaryguidelines.gov/",
  },
  cdcAlcohol: {
    id: "cdc-alcohol",
    title: "Alcohol Use and Your Health",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/alcohol/about-alcohol-use/index.html",
  },
  niaaaDrinking: {
    id: "niaaa-drinking",
    title: "What are the U.S. Guidelines for Drinking?",
    publisher: "National Institute on Alcohol Abuse and Alcoholism",
    url: "https://rethinkingdrinking.niaaa.nih.gov/how-much-too-much/what-are-us-guidelines-drinking",
  },
  nimhCare: {
    id: "nimh-care",
    title: "Caring for Your Mental Health",
    publisher: "National Institute of Mental Health",
    url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
  },
  cdcSocial: {
    id: "cdc-social",
    title: "Improving Social Connectedness",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/social-connectedness/improving/",
  },
  hhsConnection: {
    id: "hhs-connection",
    title: "Social Connection",
    publisher: "Office of the Surgeon General, U.S. Department of Health and Human Services",
    url: "https://www.hhs.gov/surgeongeneral/reports-and-publications/connection/index.html",
  },
  cdcWater: {
    id: "cdc-water",
    title: "About Water and Healthier Drinks",
    publisher: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html",
  },
} as const;

export type SourceId = keyof typeof sources;

export type Source = (typeof sources)[SourceId];

export function getSource(id: SourceId): Source {
  return sources[id];
}

export function isSourceId(value: string): value is SourceId {
  return Object.prototype.hasOwnProperty.call(sources, value);
}
