/** Common foods offered in the searchable food selector. People can also type any other food. */
export const FOOD_WORDS = [
  "apple", "apricot", "avocado", "banana", "blueberries", "cherries", "grapes", "kiwi", "lemon", "mango", "melon",
  "orange", "peach", "pear", "pineapple", "plum", "raspberries", "strawberries", "citrus",
  "asparagus", "aubergine", "beetroot", "bell pepper", "broccoli", "cabbage", "carrot", "cauliflower", "celery",
  "corn", "courgette", "cucumber", "garlic", "green beans", "kale", "lettuce", "mushrooms", "olives", "onion",
  "peas", "potatoes", "pumpkin", "spinach", "sweet potato", "tomato",
  "barley", "bread", "brown rice", "buckwheat", "couscous", "oats", "pasta", "quinoa", "rice", "rye",
  "beef", "chicken", "duck", "lamb", "pork", "bacon", "ham", "turkey", "sausage",
  "cod", "salmon", "sardines", "shrimp", "tuna", "crab", "mussels",
  "butter", "cheese", "cream", "milk", "yogurt",
  "eggs", "tofu", "tempeh", "lentils", "chickpeas", "beans", "hummus",
  "almonds", "cashews", "peanuts", "walnuts", "sesame", "sunflower seeds", "chia seeds",
  "chili", "cinnamon", "coriander", "cumin", "ginger", "mustard", "soy sauce", "vinegar", "honey", "sugar",
] as const;

export const CUISINES = [
  "Mediterranean", "Middle Eastern", "Indian", "Chinese", "Japanese", "Mexican", "Italian", "French",
  "Eastern European", "Caribbean", "African", "Home-style", "Other",
] as const;

type Translate = (english: string) => string;

/**
 * Food words and cuisines are saved in English, so meal checks keep matching them.
 * `foodWordLabel` shows a saved word in the chosen language. A word the person typed
 * that LifeZoi does not know is shown as typed.
 */
export function foodWordLabel(word: string, t: Translate): string {
  return (FOOD_WORDS as readonly string[]).includes(word) ? t(word) : word;
}

/** A suggestion picked or typed in the chosen language is saved as the English word, so saved values keep working. */
export function foodWordFromInput(text: string, t: Translate): string {
  const typed = text.trim().toLocaleLowerCase();
  const known = FOOD_WORDS.find((word) => word === typed || t(word).toLocaleLowerCase() === typed);
  return known ?? text;
}

/** The suggestions offered in the food box, in the chosen language. */
export function foodWordOptions(t: Translate): string[] {
  return FOOD_WORDS.map((word) => t(word));
}
