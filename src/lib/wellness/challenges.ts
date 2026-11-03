import type { Challenge, ChallengeDay } from "@/lib/wellness/types";

function day(
  title: string,
  what: string,
  when: string,
  alternative: string,
  sourceIds: string[],
): ChallengeDay {
  return { title, what, when, alternative, sourceIds };
}

const habit = ["nih-habits"];
const water = ["cdc-water", "medlineplus-water", "nih-habits"];
const veg = ["dga-eating-routine", "fda-produce", "nih-habits"];
const move = ["cdc-adult-activity", "cdc-older-activity", "nih-habits"];

export const challenges: Challenge[] = [
  {
    id: "hydration",
    title: "7-day hydration routine",
    summary:
      "Build a cue to notice water. There is no single amount of water for every person, and a medical fluid limit comes before any habit idea.",
    plan: [
      day(
        "Put the bottle where you see it",
        "Choose a reusable bottle you can open and wash. Set it where you already pass by when you leave home or sit down to a meal.",
        "Once, at a moment you already have.",
        "Use a glass you already own and set it in that same spot.",
        water,
      ),
      day(
        "Pair it with a habit you keep",
        "Fill the bottle when you do something you already do, such as making breakfast or sitting down to lunch. The cue is the point, not a target volume.",
        "At that existing moment.",
        "Set a glass of water on the table at one meal.",
        water,
      ),
      day(
        "Offer water at a meal",
        "Put water on the table at one meal. CDC lists serving water during meals as one way people drink more water.",
        "One meal today.",
        "Carry the bottle only as far as the next room.",
        ["cdc-water", "nih-habits"],
      ),
      day(
        "Notice a sweet drink cue",
        "When you reach for a sugary drink, pause and name the cue: thirst, habit, or the place you are in. You can still choose the drink. The pause is the practice.",
        "The next time the cue shows up.",
        "Write the cue down later if pausing in the moment feels hard.",
        ["cdc-rethink-drink", "nih-habits"],
      ),
      day(
        "Clean the bottle",
        "Wash the bottle, lid, and any straw the way the maker says to clean them. CDC says to clean and maintain devices that use water according to the manufacturer.",
        "Once today, then let it dry.",
        "Use a cup you already wash with the dishes.",
        ["cdc-water-germs"],
      ),
      day(
        "Look at the water you use",
        "If you use public tap water, find the yearly water quality report from your utility, or ask someone in the household where it is. If you use bottled water, read the label. Do not buy a filter today.",
        "Ten quiet minutes.",
        "Skip the lookup and only practice the bottle cue.",
        ["cdc-tap-standards", "fda-bottled-water"],
      ),
      day(
        "Keep one cue",
        "Mark which cue you might keep next week: the visible bottle, the meal, or the pause before a sweet drink. A missed day can be followed by one small step.",
        "This evening.",
        "Tell one person the cue, or keep it to yourself.",
        habit,
      ),
    ],
  },
  {
    id: "vegetables",
    title: "7-day vegetable routine",
    summary:
      "Practice adding vegetables you can afford and already know how to wash. Variety matters more than a perfect plate.",
    plan: [
      day(
        "Add one vegetable you like",
        "Add one vegetable you already eat to a meal you already make. The Dietary Guidelines fact sheet says small changes count and that culture and taste can guide the choice.",
        "One meal.",
        "Add a few bites, not a full extra serving.",
        veg,
      ),
      day(
        "Use what is practical",
        "Choose a fresh, frozen, or canned vegetable. The same fact sheet says fresh, frozen, and canned options all count, and in-season produce can cost less.",
        "At the shop, or from what is already home.",
        "Use a vegetable you already have, even if it is not a new kind.",
        ["dga-eating-routine"],
      ),
      day(
        "Wash before you eat or cook",
        "Rinse the produce under running water. FDA says not to use soap, detergent, or a commercial produce wash. Scrub firm items such as cucumbers with a clean brush, then dry with a clean towel.",
        "Before you cut or eat it.",
        "Buy a pre-washed package and still follow the package directions.",
        ["fda-produce"],
      ),
      day(
        "Make it easy to see",
        "Put the vegetable where you will see it before the meal. NIH describes making the healthier choice the easy choice.",
        "Before the meal you chose.",
        "Write the vegetable on a note you will see.",
        habit,
      ),
      day(
        "Add a second color",
        "If you can, add a different vegetable color to the one you used. The fact sheet describes several vegetable groups, including dark green and red or orange vegetables.",
        "One meal.",
        "Repeat yesterday’s vegetable. Repeating is still practice.",
        ["dga-eating-routine"],
      ),
      day(
        "Prepare a little ahead",
        "Wash and cut, or open and heat, enough for one extra meal. The fact sheet suggests preparing vegetables ahead when the week is busy.",
        "A time you choose.",
        "Keep the vegetable whole until you are ready to eat.",
        ["dga-eating-routine", "fda-produce"],
      ),
      day(
        "Choose what to repeat",
        "Write one vegetable step you would do again. NIH suggests tracking what you tried and treating a slip as part of the process.",
        "This evening.",
        "Say it out loud instead of writing.",
        habit,
      ),
    ],
  },
  {
    id: "fruit",
    title: "7-day fruit routine",
    summary:
      "Practice whole fruit as a simple food you can see, wash, and afford. Juice is not required.",
    plan: [
      day(
        "Pick a fruit you like",
        "Choose one whole fruit. The Dietary Guidelines fact sheet lists whole fruits such as apples, berries, and bananas as foods that can be part of a routine.",
        "Once today.",
        "Use fruit you already have at home.",
        ["dga-eating-routine"],
      ),
      day(
        "Put it where you will see it",
        "Set the fruit where a snack usually happens. NIH describes changing your surroundings so the easier choice is the one you want more often.",
        "At the usual snack time, or whenever you pass that spot.",
        "Keep the fruit in the refrigerator if that is where you look.",
        habit,
      ),
      day(
        "Wash it",
        "Rinse the fruit under running water before you eat it, even if you will peel it. FDA says washing first helps keep dirt on the surface from moving onto the part you eat. Do not use soap.",
        "Just before you eat it.",
        "Choose a fruit with a peel you remove, and still rinse it first.",
        ["fda-produce"],
      ),
      day(
        "Swap one sweet drink moment",
        "At one moment you might choose a sugary drink, try the fruit or a glass of water instead. CDC says sugary drinks are a leading source of added sugars and suggests whole fruit as one alternative to an energy drink.",
        "One moment.",
        "Keep the drink and still eat a few bites of fruit.",
        ["cdc-rethink-drink"],
      ),
      day(
        "Choose an affordable form",
        "Fresh, frozen, and canned fruit all count on the Dietary Guidelines fact sheet. If fresh fruit costs more than you can spend, choose a frozen or canned fruit with a short ingredient list.",
        "When you shop, or from the cupboard.",
        "Repeat a fruit you already bought.",
        ["dga-eating-routine"],
      ),
      day(
        "Eat it with a meal you already like",
        "Add the fruit to breakfast, lunch, or a snack you already eat. Pairing with an existing meal is a cue, not a new diet.",
        "One meal.",
        "Eat the fruit on its own.",
        ["nih-habits", "dga-eating-routine"],
      ),
      day(
        "Note the cue that worked",
        "Write whether seeing the fruit, washing it, or pairing it with a meal made it easier. Keep that cue if you want to.",
        "This evening.",
        "Skip the note and only mark the day.",
        habit,
      ),
    ],
  },
  {
    id: "walking",
    title: "7-day walking routine",
    summary:
      "Practice short movement you can already do. CDC says some activity is better than none, and that weekly activity can be split into smaller pieces of time.",
    plan: [
      day(
        "Take a short walk you can finish",
        "Walk for a length of time that feels possible today, even a few minutes. CDC says adults who do any amount of moderate activity gain some benefit, and that some activity is better than none.",
        "A time you can protect.",
        "March in place while holding a sturdy chair, or stand up and sit down slowly if a walk is not possible today.",
        move,
      ),
      day(
        "Use the same cue",
        "Start the walk after something you already do, such as a meal or a phone call. NIH describes tying a new step to a cue you already have.",
        "Right after that cue.",
        "Put your shoes where you can see them.",
        ["nih-habits", "cdc-adult-activity"],
      ),
      day(
        "Break the time up",
        "If one longer walk does not fit, take two shorter ones. CDC says the weekly activity does not have to be done all at once.",
        "Two moments in the day.",
        "Keep a single short walk.",
        ["cdc-adult-activity"],
      ),
      day(
        "Choose a supported option",
        "If balance is uncertain, walk where you can hold a rail, or practice standing up from a chair. CDC gives standing from a sitting position and heel-to-toe walking as examples of balance activity for adults 65 and older, and says to be as active as your abilities and conditions allow.",
        "Once, with support nearby.",
        "Skip balance moves and only walk a familiar route.",
        ["cdc-older-activity"],
      ),
      day(
        "Ask or go alone",
        "Invite someone if company helps, or go alone if that is easier. NIH lists support from other people as one habit skill, not a requirement.",
        "Today’s walk.",
        "Tell someone afterward instead of walking with them.",
        habit,
      ),
      day(
        "Notice the effort",
        "After the walk, note whether it felt easy, hard, or mixed. This note is your experience. It is not a fitness test.",
        "Just after you stop.",
        "Skip the note.",
        ["nih-habits"],
      ),
      day(
        "Pick one walk to repeat",
        "Choose one distance or one cue you could repeat next week. CDC describes a larger weekly picture, such as brisk walking spread across the week. You do not have to meet that picture in seven days.",
        "This evening.",
        "Keep the shortest walk that felt possible.",
        ["cdc-adult-activity", "nih-habits"],
      ),
    ],
  },
  {
    id: "sleep",
    title: "7-day sleep routine",
    summary:
      "Practice a repeatable wind-down. NHLBI says experts recommend that adults sleep 7 to 9 hours a night. That range is not an order for every person.",
    plan: [
      day(
        "Pick a wake time",
        "Choose a wake time you could keep on most days. NHLBI says to talk with a doctor if you think you are sleeping too much or too little.",
        "Tonight, decide the wake time for tomorrow.",
        "Keep your current wake time and only write it down.",
        ["nhlbi-sleep-amount"],
      ),
      day(
        "Protect a short wind-down",
        "Give yourself a few quiet minutes before bed that you can repeat. NIMH lists sticking to a sleep routine as one way to cope with stress.",
        "The last part of the evening.",
        "Sit quietly for a minute if a longer routine does not fit.",
        ["nimh-stress"],
      ),
      day(
        "Notice tomorrow’s focus",
        "In the afternoon, notice whether focusing felt easy or hard. NHLBI says sleep deficiency can make it harder to learn, focus, and react. Write this as your own note, not a diagnosis.",
        "Once in the afternoon.",
        "Skip the note if the day is too full.",
        ["nhlbi-sleep-deficiency"],
      ),
      day(
        "If heartburn is a problem, ask about timing",
        "There is no hour when everyone should stop eating. If reflux symptoms bother you, NIDDK says a doctor may recommend finishing meals 2 to 3 hours before you lie down. Follow a clinician’s plan if you have one.",
        "Only if this applies to you.",
        "Keep your usual mealtime and skip this step.",
        ["niddk-gerd"],
      ),
      day(
        "Keep the same wake time",
        "Get up at the time you chose, if you can. A different time is information, not a failure. NIH says setbacks happen when people change a habit.",
        "Tomorrow morning.",
        "Move the wake time by a little and try again.",
        ["nih-habits", "nhlbi-sleep-amount"],
      ),
      day(
        "Notice mood without judging it",
        "If you felt frustrated, cranky, or worried, you can write that down. NHLBI describes those feelings as things sleep deficiency can bring. One day does not explain the cause.",
        "Once today.",
        "Write only “today was mixed.”",
        ["nhlbi-sleep-deficiency"],
      ),
      day(
        "Keep one part of the routine",
        "Choose the wake time or the short wind-down, not both, if one is enough. NIMH says it can take trial and error to find what helps.",
        "This evening.",
        "Pause the routine and talk with a clinician if sleep stays poor.",
        ["nimh-stress", "nhlbi-sleep-amount"],
      ),
    ],
  },
  {
    id: "late-night",
    title: "7-day evening meals",
    summary:
      "Learn the difference between hunger and a habit cue in the evening. There is no single time everyone should stop eating.",
    plan: [
      day(
        "Name the cue",
        "The next time you eat in the evening, write whether you feel stomach hunger, a habit, or both. NIH says the first step in changing a habit is noticing what you do and what triggers it.",
        "The next evening snack or meal.",
        "Notice only one bite, then stop the note.",
        habit,
      ),
      day(
        "Eat at a table if you can",
        "Have one evening meal or snack at a table, without a screen in your hand if that is realistic. The point is to notice the food, not to follow a strict rule.",
        "One meal or snack.",
        "Stay where you are and put the food on a plate or in a bowl.",
        ["nih-habits"],
      ),
      day(
        "Pause before another portion",
        "After the first portion, wait a few minutes before taking more. Use the pause to ask whether you still want it. You may take more.",
        "One meal.",
        "Serve the food in the kitchen so a second portion takes an extra step.",
        habit,
      ),
      day(
        "Plan one evening option",
        "Decide earlier in the day what you might eat if you want food later. NIH describes planning a specific action so the moment is easier.",
        "Afternoon.",
        "Keep one simple food you already like where you can see it.",
        habit,
      ),
      day(
        "Leave lying down for later if reflux bothers you",
        "If you do not have reflux symptoms, keep your usual evening. If you do, NIDDK says a doctor may recommend eating 2 to 3 hours before you lie down. That is not a clock time for every person.",
        "Only if symptoms are a problem.",
        "Stay upright for a little while after eating if lying down makes symptoms worse, and ask a clinician about your own case.",
        ["niddk-gerd"],
      ),
      day(
        "Check comfort, not calories",
        "Write whether the evening meal felt comfortable. lifeZoi does not set a calorie target. The Dietary Guidelines fact sheet says calorie needs differ and that there is no one right way to eat.",
        "After the meal.",
        "Skip the note.",
        ["dga-eating-routine"],
      ),
      day(
        "Keep one evening cue",
        "Choose the pause, the plate, or the planned option. A missed evening is a chance to try the next one.",
        "Tonight.",
        "Tell someone the cue you are keeping.",
        habit,
      ),
    ],
  },
  {
    id: "sugar",
    title: "7-day sugar curiosity",
    summary:
      "Learn added sugars without shame. Fruit, milk, and vegetables already contain naturally occurring sugars. Added sugars are the ones put in during processing or at home.",
    plan: [
      day(
        "Find one added sugar on a label",
        "Read one Nutrition Facts label and look for added sugars. CDC says added sugars include sugars added in processing or at home, and do not include the sugars naturally in milk, fruit, and vegetables.",
        "Once, at home or in a shop.",
        "Look at a drink label, which is often the easiest place to see added sugars.",
        ["cdc-rethink-drink"],
      ),
      day(
        "Notice a sugary drink",
        "CDC says sugary drinks are a leading source of added sugars. Notice one you drink. You do not have to give it up today.",
        "Once today.",
        "Notice a sweetened coffee or tea if you do not drink soda.",
        ["cdc-rethink-drink"],
      ),
      day(
        "Name the feeling",
        "When you want something sweet, write hunger, habit, or a feeling. This is your experience. It is not a diagnosis of emotional eating.",
        "Once.",
        "Write only “I wanted something sweet.”",
        ["nih-habits"],
      ),
      day(
        "Try water or whole fruit once",
        "At one moment, choose water, or whole fruit, instead of a sugary drink. CDC suggests both. Missing the moment is still a day you can mark as tried or not.",
        "One moment.",
        "Use sparkling water or water with a slice of fruit.",
        ["cdc-rethink-drink", "cdc-water"],
      ),
      day(
        "Do not stock a backup",
        "If you want fewer sugary drinks in the house, leave them off the next shopping list. NIH describes removing a temptation so the choice is easier. Keep food you need.",
        "The next time you shop, or today if you shop from home.",
        "Move the drinks to a higher shelf instead.",
        ["cdc-rethink-drink", "nih-habits"],
      ),
      day(
        "Compare two labels",
        "Look at two versions of a food you eat and see which lists less added sugar. Choose either one. The comparison is the lesson.",
        "Once.",
        "Compare a drink with water.",
        ["cdc-rethink-drink"],
      ),
      day(
        "Pick one smaller step",
        "Choose one repeatable step, such as reading a label or swapping one drink. CDC’s concern about sugary drinks is about patterns over time, not one dessert.",
        "This evening.",
        "Keep the step private.",
        ["cdc-rethink-drink", "nih-habits"],
      ),
    ],
  },
  {
    id: "fiber",
    title: "7-day fiber routine",
    summary:
      "Add fiber slowly, with fluids. MedlinePlus says a sudden large increase can cause gas, bloating, and cramps. A clinician’s advice comes first if your diet is restricted.",
    plan: [
      day(
        "Find one fiber food you eat",
        "MedlinePlus lists fruits, vegetables, beans, and whole grains as fiber foods. Circle one you already eat.",
        "One meal.",
        "Look in the cupboard and only identify the food.",
        ["medlineplus-fiber"],
      ),
      day(
        "Add a small amount",
        "Add a little of that food, not a large new portion. MedlinePlus says to add fiber gradually.",
        "One meal.",
        "Add a spoonful, or a few extra bites.",
        ["medlineplus-fiber"],
      ),
      day(
        "Drink fluids you are allowed",
        "MedlinePlus says water helps fiber move through the digestive system. If a clinician has limited your fluids, follow that plan. lifeZoi does not set a water amount.",
        "With the meal.",
        "Keep your usual allowed drink.",
        ["medlineplus-fiber", "medlineplus-water"],
      ),
      day(
        "Try beans, oats, or fruit",
        "Soluble fiber is found in foods such as oats, beans, lentils, nuts, seeds, and some fruits and vegetables, according to MedlinePlus. Pick one you can tolerate.",
        "One meal.",
        "Repeat yesterday’s food if a new one does not suit you.",
        ["medlineplus-fiber"],
      ),
      day(
        "Try a whole grain or vegetable",
        "Insoluble fiber is found in foods such as wheat bran, vegetables, and whole grains. Most high-fiber foods contain both types. Variety is the lesson.",
        "One meal.",
        "Keep the peels on a fruit or vegetable you already wash, which MedlinePlus says preserves fiber.",
        ["medlineplus-fiber", "fda-produce"],
      ),
      day(
        "Notice fullness",
        "MedlinePlus says fiber can help you feel full faster. Write whether that was true for you today. Your note is personal experience.",
        "After the meal.",
        "Skip the note.",
        ["medlineplus-fiber"],
      ),
      day(
        "Keep the gradual pace",
        "Choose one fiber food to repeat next week. Do not jump to a large amount. If a clinician has given you a different plan, use that plan.",
        "This evening.",
        "Stay at the amount you tolerated.",
        ["medlineplus-fiber"],
      ),
    ],
  },
  {
    id: "sitting",
    title: "7-day sitting breaks",
    summary:
      "Break up long sitting with small movement. CDC says some activity is better than none. Use a chair version if walking is not a good fit.",
    plan: [
      day(
        "Stand or shift once",
        "During a long sit, stand up once or shift your weight if standing is difficult. CDC says adults who sit less and do any activity gain some benefit.",
        "Once during the longest sit of the day.",
        "Roll your shoulders or circle your ankles while seated.",
        ["cdc-adult-activity"],
      ),
      day(
        "Tie the break to a cue",
        "Stand or stretch after a show ends, a call ends, or a chapter ends. NIH describes using a cue you already have.",
        "At that cue.",
        "Set the cue as “after I finish this glass of water.”",
        ["nih-habits", "cdc-adult-activity"],
      ),
      day(
        "Take two short moves",
        "Repeat a short walk or a chair stand twice. CDC says activity can be broken into smaller pieces of time.",
        "Two moments.",
        "Do one break only.",
        ["cdc-adult-activity"],
      ),
      day(
        "Use a chair if you want",
        "Practice standing up from a chair and sitting back down, if that is safe for you. CDC lists this as a balance example for older adults and says to match activity to your abilities.",
        "A few slow repetitions, or one.",
        "Stay seated and march your feet.",
        ["cdc-older-activity"],
      ),
      day(
        "Walk a familiar path",
        "If you can walk, take a short walk inside or outside. Hold a rail if balance is uncertain.",
        "Once.",
        "Stay with the chair version.",
        ["cdc-adult-activity", "cdc-older-activity"],
      ),
      day(
        "Notice stiffness without forcing a stretch",
        "Write whether a break changed how your body felt. Stop any move that hurts. This note is your experience.",
        "After one break.",
        "Skip the note.",
        ["cdc-older-activity"],
      ),
      day(
        "Keep one break",
        "Choose one cue you could use next week. You do not have to erase sitting from the day.",
        "This evening.",
        "Keep the seated ankle circles only.",
        ["nih-habits", "cdc-adult-activity"],
      ),
    ],
  },
  {
    id: "muscles",
    title: "7-day strength practice",
    summary:
      "Practice simple strength and balance moves that you can modify. Not every exercise fits every condition. CDC says adults need muscle-strengthening activity on 2 or more days a week, and that people who cannot meet the full picture should be as active as their abilities allow.",
    plan: [
      day(
        "Learn the weekly picture",
        "Read CDC’s short description: muscle-strengthening activity for the major muscle groups on 2 or more days a week, plus aerobic activity. You are not asked to finish that picture today.",
        "Once.",
        "Ask someone to read it with you.",
        ["cdc-adult-activity"],
      ),
      day(
        "Stand up from a chair",
        "If it is safe, sit in a sturdy chair and stand up slowly, then sit back down. CDC gives standing from a sitting position as a balance example for adults 65 and older. Stop if it hurts or feels unsafe.",
        "A few slow repetitions, or just one.",
        "Press your hands together in front of your chest while seated.",
        ["cdc-older-activity"],
      ),
      day(
        "Rest the next practice",
        "Strength practice does not have to be daily. Use today to walk a little or to rest. CDC’s muscle-strengthening picture is at least 2 days in a week, not every day.",
        "Today.",
        "Repeat one easy chair stand if you feel well and want to.",
        ["cdc-adult-activity"],
      ),
      day(
        "Try a second simple push",
        "Seated, press your palms together gently, then relax. This is a practice idea for the arms and chest, not a researched program. Skip it if a clinician has limited those movements.",
        "A few easy presses.",
        "Squeeze a soft towel.",
        ["cdc-adult-activity"],
      ),
      day(
        "Add a balance option",
        "If you feel steady, walk heel to toe beside a counter you can hold. CDC lists heel-to-toe walking as a balance example. Hold on the whole time if you want.",
        "A few steps.",
        "Stand near the counter and shift your weight while holding on.",
        ["cdc-older-activity"],
      ),
      day(
        "Repeat the move that felt possible",
        "Do the chair stand, the palm press, or the supported balance step again. NIH says realistic goals are easier to keep.",
        "Once.",
        "Do one repetition and stop.",
        ["nih-habits", "cdc-older-activity"],
      ),
      day(
        "Decide what to ask a professional",
        "If a condition, pain, or disability changes what you can do, write one question for a clinician or physical therapist. lifeZoi cannot match an exercise to a diagnosis.",
        "This evening.",
        "Skip the question and keep only the move that felt safe.",
        ["cdc-older-activity"],
      ),
    ],
  },
  {
    id: "stress-eating",
    title: "7-day stress and food cues",
    summary:
      "Notice stress and food without shame. This is not treatment. NIMH says a mental health professional can help when stress or anxiety will not ease, and that therapy and medication are decisions for that professional.",
    plan: [
      day(
        "Name the stressor",
        "Write one external thing that is pressing today. NIMH describes stress as a response to an external cause.",
        "Once.",
        "Write “a lot is going on” if you do not want to name it.",
        ["nimh-stress"],
      ),
      day(
        "Notice food beside the feeling",
        "If you eat when the feeling is strong, write that down as your experience. NIH also suggests looking for triggers. lifeZoi is not diagnosing emotional eating.",
        "Once, if it happens.",
        "Skip this if food and feelings were not connected today.",
        ["nimh-stress", "nih-habits"],
      ),
      day(
        "Try one listed coping step",
        "NIMH suggests a journal, a relaxation or breathing practice, a regular meal, movement, a sleep routine, less excess caffeine, or calling someone who helps. Pick one.",
        "A few minutes.",
        "Step outside or into another room.",
        ["nimh-stress"],
      ),
      day(
        "Eat a regular meal if you can",
        "NIMH lists healthy, regular meals as one coping step. Use a meal you already know how to make. There is no calorie target.",
        "One meal.",
        "Eat a smaller plate of a usual food.",
        ["nimh-stress", "dga-eating-routine"],
      ),
      day(
        "Take a short walk or a seated break",
        "Move in a way that fits your body. CDC says some activity is better than none. NIMH lists exercise as one option, not the only one.",
        "A few minutes.",
        "Do a slow breathing practice while seated.",
        ["nimh-stress", "cdc-adult-activity"],
      ),
      day(
        "Contact someone",
        "Reach out to a person who is supportive, if you have someone and want to. NIMH lists friends and family as one source of coping. Being alone today is also allowed.",
        "Once, if you want.",
        "Write what you would have said.",
        ["nimh-stress"],
      ),
      day(
        "Know the limit of this challenge",
        "If stress is interfering with your life, NIMH says it may be time to talk with a professional. If you are in immediate distress in the United States, call or text 988. lifeZoi is not a crisis service and not a substitute for care.",
        "This evening.",
        "Save the professional question for another day if you are safe and want more time.",
        ["nimh-stress", "samhsa-988"],
      ),
    ],
  },
  {
    id: "tobacco-alcohol",
    title: "7-day tobacco and alcohol reflection",
    summary:
      "A private look at smoking and drinking, without shame. Quitting or cutting down is your choice. Free public information is linked. lifeZoi does not provide treatment.",
    plan: [
      day(
        "Read one public page",
        "Open CDC’s cigarette smoking page or NIAAA’s page on alcohol’s effects on the body. Read only what you can take in. Both describe health effects in plain public language.",
        "Ten minutes, or less.",
        "Ask someone to read a paragraph with you.",
        ["cdc-smoking", "niaaa-alcohol-body"],
      ),
      day(
        "Notice one cue",
        "Write one time or place linked with smoking or drinking, if either is part of your life. NIH describes looking for triggers. If neither applies, write that and rest.",
        "Once.",
        "Skip the note.",
        ["nih-habits"],
      ),
      day(
        "Look at free quit support",
        "Smokefree.gov, from the National Cancer Institute, offers free planning tools for people who want to quit smoking. You do not have to sign up. Text programs may have phone-carrier charges.",
        "Once, only if smoking is relevant.",
        "Look at the page and close it.",
        ["smokefree"],
      ),
      day(
        "Look at alcohol information",
        "NIAAA’s health hub lists treatment information and Rethinking Drinking. Open it only if you want. The Dietary Guidelines fact sheet says drinking less is better for health and that alcohol is not safe in pregnancy.",
        "Once, only if you want.",
        "Skip this day if alcohol is not part of your question.",
        ["niaaa-alcohol-hub", "dga-eating-routine"],
      ),
      day(
        "Replace one cue with a different action",
        "If a cue shows up, try water, a short walk, or leaving the room. Smokefree.gov describes planning a different action for a smoking trigger. The same idea can be a personal experiment around a drink.",
        "Once, if a cue appears.",
        "Delay the cigarette or drink by a few minutes and notice what happens.",
        ["smokefree", "nih-habits"],
      ),
      day(
        "Write one reason that is yours",
        "If you want to smoke less, drink less, or quit, write a reason that matters to you. This is your motivation, not a lecture. If you do not want a change, write that honestly.",
        "Once.",
        "Keep the reason in your head.",
        ["nih-habits"],
      ),
      day(
        "Choose a next human resource",
        "A clinician, a quitline, Smokefree.gov, or NIAAA’s treatment information can help. CDC says counseling and medication can help people quit smoking, and that those are supports, not something lifeZoi prescribes. lifeZoi will not tell you to change a medicine.",
        "This evening.",
        "Do nothing more than bookmark a page.",
        ["cdc-smoking", "smokefree", "niaaa-alcohol-hub"],
      ),
    ],
  },
];

const journeyThemes: ChallengeDay[] = [
  day("Notice one habit cue", "Write one daily action and the moment that triggers it.", "Once.", "Notice it silently.", ["nih-habits"]),
  day("Make one choice easier", "Put a helpful object where you will see it: shoes, a glass, or a piece of fruit.", "Once.", "Write a reminder where you cook.", ["nih-habits"]),
  day("Set a small goal", "Choose a goal you could do on a busy day.", "Once.", "Make the goal even smaller.", ["nih-habits"]),
  day("Ask for or decline support", "Tell one person, or decide to practice alone.", "Once.", "Write what you would have said.", ["nih-habits"]),
  day("Track one action", "Mark what you tried. Tracking is for focus, not for a score.", "Evening.", "Remember it without writing.", ["nih-habits"]),
  day("Plan for a slip", "NIH says setbacks happen. Decide what the next small step would be after a missed day.", "Once.", "Say “I can start again.”", ["nih-habits"]),
  day("Reward the effort kindly", "NIH suggests a healthy reward after a small step, such as a rest or a call with someone you like. Do not use the reward as a test you can fail.", "After one step.", "The check-in itself can be the record.", ["nih-habits"]),
  day("See the bottle", "Set a water bottle or glass where a routine already happens.", "Once.", "Use a cup you already own.", ["cdc-water", "nih-habits"]),
  day("Water at a meal", "Put water on the table at one meal. There is no volume to finish.", "One meal.", "Take one sip and stop.", ["cdc-water"]),
  day("Read a drink label", "Look for added sugars on one drink. CDC separates those from sugars naturally in milk and fruit.", "Once.", "Compare the drink with water.", ["cdc-rethink-drink"]),
  day("Add a vegetable you like", "Add one familiar vegetable to a meal.", "One meal.", "Use frozen or canned.", ["dga-eating-routine"]),
  day("Wash the produce", "Rinse it under running water. Do not use soap.", "Before you eat or cook.", "Follow a package that says it is pre-washed.", ["fda-produce"]),
  day("Add a fruit you like", "Set out one whole fruit.", "Once.", "Use fruit already at home.", ["dga-eating-routine"]),
  day("Shop for one affordable produce item", "Choose fresh, frozen, or canned. In-season fruit and vegetables can cost less.", "When you shop, or from home stock.", "Repeat a food you already tolerate.", ["dga-eating-routine"]),
  day("Add fiber slowly", "Add a small amount of beans, oats, fruit, or a whole grain. Increase slowly.", "One meal.", "Repeat a tiny portion.", ["medlineplus-fiber"]),
  day("Fluids with fiber", "Drink fluids you are allowed. A fluid restriction from a clinician overrides this step.", "With the meal.", "Keep your usual allowed drink.", ["medlineplus-fiber", "medlineplus-water"]),
  day("Cook once", "Make one simple meal at home, even a small one. The fact sheet suggests starting with one home-cooked dinner a week.", "Once.", "Assemble a meal from foods you already cooked.", ["dga-eating-routine"]),
  day("A short walk", "Walk for a few minutes, or march in place with support.", "Once.", "Stand up once from a chair if that is safer.", ["cdc-adult-activity", "cdc-older-activity"]),
  day("Split the movement", "Take two short movement breaks instead of one long one.", "Twice.", "Do one break.", ["cdc-adult-activity"]),
  day("A strength day", "Try a slow chair stand or a gentle palm press if those are safe. Stop if it hurts.", "A few repetitions or one.", "Squeeze a towel while seated.", ["cdc-adult-activity", "cdc-older-activity"]),
  day("A balance day", "Heel-to-toe steps while holding a counter, or stand and hold the counter.", "Once.", "Stay seated and circle your ankles.", ["cdc-older-activity"]),
  day("Rest or walk lightly", "Muscle-strengthening is not a daily requirement on CDC’s page. Rest or take an easy walk.", "Today.", "Do nothing extra and mark the rest.", ["cdc-adult-activity"]),
  day("Choose a wake time", "Pick a wake time you could repeat. NHLBI describes 7 to 9 hours as an expert range for adults, not a personal order.", "Tonight.", "Write your current wake time.", ["nhlbi-sleep-amount"]),
  day("A short wind-down", "Keep a few quiet minutes before bed.", "Evening.", "Sit quietly for one minute.", ["nimh-stress"]),
  day("Notice focus", "Notice whether focusing felt easy or hard. NHLBI links sleep deficiency with trouble focusing. Your note is not a diagnosis.", "Afternoon.", "Skip the note.", ["nhlbi-sleep-deficiency"]),
  day("Name a stressor", "Write one pressure of the day. NIMH describes stress as a response to something external.", "Once.", "Write “a full day.”", ["nimh-stress"]),
  day("One coping step", "Try a regular meal, a short walk, breathing, or a call. NIMH lists these as options.", "A few minutes.", "Change rooms.", ["nimh-stress"]),
  day("Evening cue", "Notice whether an evening snack is hunger, habit, or both. There is no hour when everyone must stop eating.", "Evening.", "Use a plate and pause.", ["nih-habits", "niddk-gerd"]),
  day("Review the month", "Mark which cues you might keep. NIH says to focus on progress, and that improvement takes time.", "Once.", "Circle one cue only.", ["nih-habits"]),
  day("Choose the next resource", "Pick one public page to revisit, or one question for a clinician. Your worth does not depend on how many days you marked.", "Once.", "Close the challenge and rest.", ["nih-habits", "cdc-adult-activity"]),
];

challenges.push({
  id: "habits-30",
  title: "30-day healthy habits journey",
  summary:
    "One small step a day. The journey teaches cues, tracking, and patience. It does not promise a result, and a missed day is not a failure.",
  plan: journeyThemes,
});

challenges.push({
  id: "choose-moment",
  title: "7-day Choose Your Moment",
  summary:
    "Once a day, if a snack is not physical hunger, spend a few minutes on something else that matters, including rest. If you are hungry, eat. A missed day stays in the past and does not erase earlier check-ins.",
  plan: [
    day("Name the moment", "If you want a snack, ask whether you are physically hungry. Hunger gets food.", "Once.", "Write the question and answer it later.", ["medlineplus-emotional-eating", "nih-habits"]),
    day("Pick one better use of ten minutes", "Choose rest, a person, a small task, or a few minutes of learning.", "About ten minutes.", "Sit quietly for one minute. Rest counts.", ["mayo-emotional-eating", "nih-habits"]),
    day("Change one cue", "Move one snack you reach for automatically, or put a book where that snack was.", "Once.", "Leave the snack and change rooms.", ["nih-habits"]),
    day("Write an if-then line", "If evening boredom shows up and you are not hungry, then open Choose Your Moment.", "Once.", "Say the line without writing it.", ["nci-if-then"]),
    day("A seated body-care option", "Roll your shoulders or stretch only as far as is comfortable. Skip anything that hurts.", "A few minutes.", "Rest your hands in your lap and breathe once.", ["cdc-older-activity", "nccih-mindfulness"]),
    day("Connect or create", "Send one kind message, or make one small thing: a note, a drawing, or a tidy corner.", "About ten minutes.", "Look at a photo of someone you care about.", ["medlineplus-emotional-eating"]),
    day("Keep the record", "Mark what you tried. A miss is information. It does not delete the week.", "Evening.", "Remember one detail without marking it.", ["nih-habits", "mayo-emotional-eating"]),
  ],
});

const naturePrompts: [string, string, string, string, string[]][] = [
  ["Daylight", "Spend a few minutes in daylight: a window, doorway, bench, or short outing.", "Once today.", "Stay by a window if going out is hard.", ["cdc-sun-safety", "nimh-sad"]],
  ["Ground", "Notice the ground from a bench, with shoes on, or with a gloved hand on grass. Skip unsafe ground.", "Once.", "Look at a plant indoors.", ["pmc-green-space", "cleveland-earthing"]],
  ["Tree or sky", "Look at a tree, birds, or the sky. Do not climb or disturb wildlife.", "A few minutes.", "Use a photo if you cannot go out.", ["cleveland-forest", "pmc-forest"]],
  ["Move outside", "Walk, roll, stretch, or sit outside. There is no required distance.", "Once.", "March in place by a window.", ["cdc-adult-activity", "cdc-sun-safety"]],
  ["Food from plants", "Add one vegetable or fruit you already tolerate. Wash it. No food is a treatment.", "One meal.", "Use a food you already have.", ["dga-eating-routine", "fda-produce"]],
  ["Company or quiet", "Share the outing, or enjoy it alone. Both count.", "Once.", "Send a photo of the sky to someone.", ["nih-habits"]],
  ["Write one line", "Note mood or energy in your own words. The note is not a diagnosis.", "Evening.", "Skip the note. The day still counts.", ["nih-habits", "nimh-sad"]],
];

challenges.push({
  id: "nature-7",
  title: "7 days closer to nature",
  summary:
    "Pick small outdoor or daylight moments. Nothing here promises a medical result in seven days, and a missed day is not a failure.",
  plan: naturePrompts.map(([title, what, when, alternative, sourceIds]) =>
    day(title, what, when, alternative, sourceIds),
  ),
});

challenges.push({
  id: "nature-30",
  title: "30 days closer to nature",
  summary:
    "The same kinds of moments, repeated gently for a month. Rest days are allowed. Nature is not medicine.",
  plan: Array.from({ length: 30 }, (_, index) => {
    const [title, what, when, alternative, sourceIds] = naturePrompts[index % naturePrompts.length];
    return day(`Day ${index + 1}: ${title}`, what, when, alternative, sourceIds);
  }),
});

export const SHARED_SEVEN_DAY_IDS = ["hydration", "vegetables", "fruit", "walking", "sleep"] as const;

export function challengeById(id: string) {
  return challenges.find((item) => item.id === id) ?? null;
}

export function challengeDayKey(challengeId: string, index: number) {
  return `${challengeId}-day-${index + 1}`;
}

export function daysSinceStart(startedOn: string, today: string) {
  const [year, month, dayOfMonth] = startedOn.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = today.split("-").map(Number);
  const start = Date.UTC(year, month - 1, dayOfMonth);
  const current = Date.UTC(todayYear, todayMonth - 1, todayDay);
  return Math.round((current - start) / 86400000);
}
