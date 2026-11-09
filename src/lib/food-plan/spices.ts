export type Spice = {
  id: string;
  name: string;
  flavor: string;
  culinary: string[];
  combinations: string;
  traditional: string;
  caution: string;
};

export const SPICES: Spice[] = [
  {
    id: "turmeric",
    name: "Turmeric",
    flavor: "Earthy, slightly bitter, and warm.",
    culinary: ["Stir a pinch into lentils, rice, or roasted vegetables.", "It colors food gold. A little goes a long way."],
    combinations: "Cumin, ginger, and black pepper in savory pots.",
    traditional: "Used in many South Asian kitchens. Some traditional writing links it with warmth. That is cultural description, not a medical class.",
    caution: "Use it as a cooking spice. A pinch in food is not a supplement. Concentrated products are a different thing and can interact with medicines. This guide does not recommend supplements.",
  },
  {
    id: "ginger",
    name: "Ginger",
    flavor: "Hot, citrusy, and fresh when raw. Softer when cooked.",
    culinary: ["Grate a little into lentils, vegetables, or tea you brew at home.", "Dried ground ginger suits oats and fruit."],
    combinations: "Garlic, turmeric, and citrus.",
    traditional: "Widely used in cooking. Traditional texts sometimes call it warming. LifeZoi does not treat that as a diagnosis.",
    caution: "Culinary amounts are for flavor. Ginger supplements are not the same as a slice in a pan, and this page does not suggest them.",
  },
  {
    id: "cinnamon",
    name: "Cinnamon",
    flavor: "Sweet, woody, and warm.",
    culinary: ["A pinch on oats, apples, or cooked squash.", "A little in a pot of beans if you like that contrast."],
    combinations: "Apple, oats, and cardamom.",
    traditional: "Used in sweet and savory cooking across several traditions. Flavor is the point here.",
    caution: "Cassia cinnamon in large supplemental amounts is not a kitchen pinch. This guide is about food, not capsules, and it does not claim to change blood sugar.",
  },
  {
    id: "cardamom",
    name: "Cardamom",
    flavor: "Floral, citrusy, and sweet-spice.",
    culinary: ["Crush a pod for rice, oats, or stewed fruit.", "A pinch of ground cardamom on yogurt or cooked grains."],
    combinations: "Cinnamon, orange zest, and rice.",
    traditional: "Common in South Asian and Middle Eastern sweets and rice. A traditional association is aroma and celebration, not treatment.",
    caution: "Use the pods or a pinch of powder in food. Do not replace a medicine with cardamom.",
  },
  {
    id: "cumin",
    name: "Cumin",
    flavor: "Toasty, earthy, and savory.",
    culinary: ["Warm the ground spice in oil for a few seconds, then add beans or vegetables.", "Sprinkle a pinch on roasted carrots or squash."],
    combinations: "Coriander, garlic, and beans.",
    traditional: "A daily spice in many cuisines. Some traditional systems call it drying or warming. That language is not a biological test.",
    caution: "Kitchen cumin is a seasoning. Cumin supplements are outside this guide.",
  },
  {
    id: "coriander",
    name: "Coriander",
    flavor: "Citrusy, mild, and slightly sweet. The fresh leaves are brighter than the seed.",
    culinary: ["Use ground seed with beans and roasted vegetables.", "Add fresh leaves at the end of a salad or pot."],
    combinations: "Cumin, lime, and chickpeas.",
    traditional: "Seed and leaf are both food. Traditional pairings are about taste and custom.",
    caution: "If you dislike the leaf, use the seed or skip it. No health claim comes with either form.",
  },
  {
    id: "fennel",
    name: "Fennel",
    flavor: "Sweet and licorice-like. The bulb is a vegetable. The seed is the spice.",
    culinary: ["Toast a pinch of seed for cabbage, carrots, or cooked fish.", "Slice the bulb raw into a salad or roast it."],
    combinations: "Orange, fish, and cabbage.",
    traditional: "The seed appears in several traditional kitchens after meals. Here it is a flavor, not a remedy.",
    caution: "Culinary fennel is food. Fennel supplements and essential oils are not part of this guide.",
  },
  {
    id: "black-pepper",
    name: "Black pepper",
    flavor: "Sharp, piney, and hot.",
    culinary: ["Grind it over eggs, vegetables, beans, and salads.", "A pinch is enough for most plates."],
    combinations: "Almost any savory dish, including turmeric and lemon.",
    traditional: "Sometimes paired with turmeric in traditional cooking. That pairing is a flavor custom on this page, not a medical instruction.",
    caution: "Ground pepper in food is not a supplement. Do not take pepper extracts based on this guide.",
  },
  {
    id: "basil",
    name: "Basil",
    flavor: "Sweet, clove-like, and fresh.",
    culinary: ["Tear leaves over tomatoes, beans, and salads.", "Stir into a warm pot at the end so the flavor stays bright."],
    combinations: "Tomato, olive oil, and beans.",
    traditional: "A summer herb in many kitchens, including New England gardens. Traditional use here means cooking custom.",
    caution: "Use the leaves as food. Basil oil and capsules are not suggested.",
  },
  {
    id: "rosemary",
    name: "Rosemary",
    flavor: "Piney, strong, and savory.",
    culinary: ["A small sprig with roasted potatoes, squash, or beans.", "Chop the needles finely. A little is plenty."],
    combinations: "Potato, garlic, and lemon.",
    traditional: "A Mediterranean cooking herb. Any traditional story about memory or cleansing is not a claim LifeZoi makes.",
    caution: "The sprig in a pan is the use on this page. Concentrated rosemary oil is not a food portion.",
  },
  {
    id: "mint",
    name: "Mint",
    flavor: "Cool and bright.",
    culinary: ["Tear into cucumber salads, peas, or yogurt.", "A leaf in a glass of water is a flavor, not a treatment."],
    combinations: "Cucumber, peas, lemon, and yogurt.",
    traditional: "Used fresh in many cuisines. Cooling language in traditional texts is metaphor and custom, not a diagnosis.",
    caution: "Kitchen mint is a leaf. Peppermint oil capsules are supplements and are not recommended here.",
  },
];

export function spiceById(id: string): Spice | null {
  return SPICES.find((item) => item.id === id) ?? null;
}
