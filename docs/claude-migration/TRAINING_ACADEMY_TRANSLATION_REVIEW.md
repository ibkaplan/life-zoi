# Training Academy translations: phrases for a native speaker to check

Lesson bodies of all five courses (50 lessons, about 40,000 English words) were translated into Russian, Ukrainian, and Greek by Claude on 2026-11-25. They have not been read by a native speaker yet. The lists below are the places the translators were least sure about. Everything else also deserves a read, especially safety and care notes.

Files: `src/lib/i18n/catalog/<ru|uk|el>/growth-<course>-lessons.json`. To change a translation, edit the value, never the English key.

## Choices that apply everywhere

- The reader is addressed formally («вы», «ви», «εσείς»). Example answers said to a friend or family member use the informal form inside the quotes.
- Russian and Ukrainian need a gender for past-tense verbs. Example answers use one gender each, mixed across the course. Some field labels use paired forms such as «заметил(а)» or «пройшов (пройшла)». Please check that these read well, including when Listen reads them aloud.
- Greek: a course is «μάθημα» and a lesson is «ενότητα», as in the existing menus and titles. Polysyllabic words were checked by script for a missing τόνος (none found), but accents still need a human read.
- People's names were given local spellings (for example Maria → Мария / Марія / Μαρία).
- Feedback cue words (`"cue: …"` entries) are word lists, not sentences. Some are broad (Russian «нет», Ukrainian «ні», Greek «και», «ένα», «τι»), mirroring equally broad English cues such as "and" or "what".

## ru · mindfulness
1. Daniel → Даниил (Russian form, not Даниэль)
2. Kenji → Кэндзи; Oluwaseun → Олувасеун; Samuel → Самуил (transliteration)
3. "thinking" / "wandering" labels → «думаю» / «отвлёкся» (second is masculine only)
4. "as you might guide a puppy back to its bed" → «как будто мягко возвращаете щенка на его лежанку»
5. "the 'not enough time' story" → «история про „не хватает времени“» («история» or «сценарий»?)
6. Thought labels → «планирую», «тревожусь», «вспоминаю», «оцениваю», «воображаю»
7. "Use 'and' instead of 'but'" → «и» вместо «но»; cue is just «и»
8. "Mindful single-tasking" → «одно дело за раз»
9. "parked car" → «машину на стоянке» / «в машину или транспорт»
10. "It sounds like you're stretched really thin" → «Похоже, у тебя совсем не осталось сил»
11. Gendered labels «заметил(а)», «слушал(а)» (reads well aloud?)
12. "catering business" → «кейтеринговым бизнесом»

## ru · resilience
1. resilience → «устойчивость» (matches existing catalog; «жизнестойкость» may sound more natural)
2. fixed way of thinking → «застывшее мышление» («установка на данность» is an option)
3. Add "yet" → «пока»: «У меня пока не получается»
4. "I'm just not a numbers person" → «просто не дружите с цифрами»
5. "I'm just not a water person" → «Я просто не создана для воды»
6. The challenge I came through → «Трудность, которая осталась позади»
7. "I'm too old to pick up new technology" → «В моём возрасте новую технику уже не освоить»
8. sinking feeling → «у вас ёкает сердце»
9. Perspective → «Взгляд со стороны»
10. community repair group → «местную группу мастеров-ремонтников»
11. Names: Кваме, Лусия, Прия, Томаш, Грейс, Хасан, Ана, Мэй, Олумиде, Эстер, Даниэль

## ru · confidence
1. Support cue → «друг | друзья | подруг | поддерж | сестр | брата | помог | муж» ("partner" became «муж»)
2. Maria's "nothing special" week → «Ничего особенного» — неделя Марии
3. Clear beats clever → «Ясность важнее красноречия»
4. neurodivergent people → «нейроотличным людям»
5. neighborhood association → «собрание жителей своего района»
6. Names: Кваме, Надя, Томас, Мэй, Олу
7. Gendered example answers («Я согласна…», «Я разбил всё…»): one gender picked per example
8. "Oh come on, you're so good at this!" → «Ну перестань, у тебя же это так хорошо получается!»

## ru · emotional intelligence
1. stressed vs embarrassed (Kofi's evening) → «стресс» vs «неловкость»
2. a sinking stomach → «ощущение, будто всё оборвалось внутри»
3. "Are you still not done?" → «Ещё не готово?»
4. bake sale → «благотворительная ярмарка выпечки»
5. stung → «задело»
6. "I'll know when I know" → «Узнаю, когда узнаю»
7. "this is a 'what if', not a fact" → «Это „а вдруг“, а не факт»
8. "I'm frazzled" → «Я на взводе»
9. Housemate → «сосед по квартире»; community meeting → «собрание жителей района»
10. Names: Кофи, Елена, Прия, Томас, Грейс, Джун, Абдул, Наоми, София, Маркус

## uk · mindfulness
1. Names: Даніель, Семюел, Олувасеун, Кендзі, Мей, Грейс, Томас (borrowed forms, not Данило / Самуїл)
2. Gendered labels «помітив(-ла)», «міг (могла) б» (on screen and read aloud)
3. thinking / wandering labels → «думаю» / «блукаю»
4. judging → «оцінюю», «оцінювальна думка» (or «засуджую»?)
5. the 'not enough time' story → «історія про те, що ні на що не вистачає часу»
6. savory → «насичений, пікантний»
7. That sounds really frustrating → «Схоже, це страшенно дратує»
8. just vent for a minute → «просто трохи виговоритися»; so I don't snap → «щоб не огризнутися»
9. care homes → «будинки для літніх людей»

## ru · communication
1. Assertive → «уверенный» / «уверенное общение» (or textbook «ассертивный»)
2. Reflecting back → «отражение услышанного» / «отразить» (bookish for older readers?)
3. Names: Даниил, Томас, Хироси, Кваме
4. "Prepare, then wait one more breath" → «а потом сделайте ещё один вдох»
5. "then I'm all yours" → «а потом я слушаю только тебя»
6. "Does that make sense?" → «Понятно?»
7. "a family reunion" → «большая семейная встреча»
8. "Point, reason, next step" → «мысль, причина, следующий шаг»
9. "he snapped" → «огрызнулся»
10. Gendered first-person forms («Я бы хотел/хотела», labels with «(а)»)

## uk · resilience
1. yet → «поки що» (the "add 'yet'" device)
2. growth mindset / fixed thinking → «мислення зростання» / «застигле мислення»
3. Perspective → «Погляд з відстані» (or «Ширший погляд»?)
4. "not a numbers person" → «просто не дружу з цифрами»; "not a water person" → «не дружу з водою»
5. Names: Кваме, Лусія, Прія, Томаш, Ґрейс, Хасан, Ана, Мей, Олуміде, Естер, Деніел
6. Milestones → «проміжні етапи»; stepping stones → «камінці для переходу»
7. sinking feeling → «відчуваєте, як серце падає»
8. "I'm too old to pick up new technology" → «Я вже не в тому віці, щоб освоювати нові технології»
9. Paired gender forms in labels «пройшов (пройшла)», «погодився (погодилася)»
10. "two-minute tidy" → «двохвилинне прибирання»; "community repair group" → «місцева група, яка ремонтує речі»

## uk · confidence
1. Clear beats clever → «Зрозуміло краще, ніж розумно» (wordplay lost)
2. "Oh, it's nothing." → «Ой, та нічого особливого»
3. All-or-nothing words → Слова «все або нічого»
4. Fortune telling → «Ворожіння» (or «Пророкування»)
5. "I always freeze in meetings" → «Я завжди ціпенію на нарадах»
6. neurodivergent people → «нейровідмінним людям»
7. Hardest for now → «Найважче поки що»
8. "Oh come on, you're so good at this!" → «Ну ж бо, у тебе так добре це виходить!»
9. Partial yes → Часткове «так»
10. Names: Марія, Кваме, Дієго, Лена, Сем, Прія, Мей, Роза, Санджай, Фатіма, Томас, Надія, Олу

## uk · communication
1. Names: Деніел, Кваме, Хіроші, Грейс, Томас, Семе (vocative)
2. "and then I'm all yours" → «А потім я тільки твій» (male form)
3. assertive → «впевнений / впевнене спілкування» (or «асертивний»)
4. "I" language → «я-повідомлення»; reflecting back → «відображення почутого»
5. family reunion → «велика родинна зустріч»
6. "stretched thin" → «перевантажений»; "That sounds like a lot" → «Схоже, у тебе був важкий день»
7. "meet them halfway" → «піти йому назустріч»
8. Masculine forms in some examples/placeholders («Я хотів би…», «Ситуація, яку я обрав»)
9. "shop" → «крамниця»

## uk · emotional intelligence
1. "pause and choose" → «пауза і вибір»
2. "check-in" → «коротка перевірка себе»
3. "I feel..." statements → «Я відчуваю...» (template uses «мені було [емоція]»)
4. Worry patterns → «Читати думки» / «Забігати наперед» / «Ходити по колу»
5. Instead of 'angry' → «роздратування, образа, ображеність, досада, відчуття зради»
6. "stung" → «мене зачепило»; "I'm frazzled" → «Я на межі, дайте мені хвилинку»
7. "Are you still not done?" → «Ще й досі не готово?»
8. "I didn't realize" → «мені й на думку не спадало»
9. Names: Кофі, Олена, Прія, Томас, Ґрейс, Джун, Абдул, Наомі, Софія, Маркус (Ґ in Ґрейс?)
10. Bake sale → «благодійний ярмарок випічки»

## el · confidence
1. Cue "this time | one | today" includes bare «ένα» (may match too many answers)
2. Cue "strength" → «δυνατ» also matches «δυνατά» (aloud)
3. "I always mess things up" → «Πάντα τα κάνω θάλασσα»
4. "My manager must think I am hopeless" → «με θεωρεί απελπιστική περίπτωση»
5. "Clear beats clever" → «Το σαφές μετράει περισσότερο από το έξυπνο»
6. "Working with nervousness" → «Πώς να συνεργαστείτε με το άγχος»
7. neurodivergent people → «νευροαποκλίνοντες άνθρωποι»
8. "help with a petition" → «αίτηση με υπογραφές» (or «συλλογή υπογραφών»?)
9. "a change of scene" → «μια αλλαγή παραστάσεων»
10. Names: Μαρία, Κουάμε, Λένα, Ντιέγκο, Σαμ, Πρίγια, Μέι, Ρόζα, Σαντζέι, Φατίμα, Τομάς, Νάντια, Ολού
11. Accents were not checked automatically: please read the Greek for τόνος

## el · mindfulness
1. Savoring steps written as first-person verbs (Προσέχω / Μένω / Νιώθω)
2. stop, breathe, notice → «σταματώ, αναπνέω, προσέχω»
3. Single-tasking → «Μία δουλειά τη φορά»
4. backup option → «εναλλακτική»
5. savory → «ουμάμι»
6. "I'm having the thought that…" → «Έχω τη σκέψη ότι…»
7. wound up → «τσιτωμένος»; vent for a minute → «να ξεσπάσεις λίγο»
8. guide a puppy back to its bed → «όπως θα οδηγούσατε ένα κουταβάκι πίσω στο κρεβατάκι του»
9. «πέλματα» vs «πόδια» in the body scan
10. Names: Ντάνιελ, Αΐσα, Κέντζι, Ρόζα, Τομάς, Πρίγια, Γκρέις, Ολουασέγκουν, Μέι, Σάμιουελ

## el · resilience
1. Names: Κουάμε, Λουσία, Πρίγια, Τόμας, Γκρέις, Χασάν, Άνα, Μέι, Ολουμίντε, Εσθήρ, Ντάνιελ
2. growth-oriented thinking → «σκέψη που κοιτάζει την εξέλιξη»; fixed thinking → «άκαμπτη σκέψη»
3. Add "yet" → «ακόμα»
4. "After I…, I will…" → «Αφού…, θα…»
5. "sleep on it" → «κοιμηθείτε και ξαναδείτε το αύριο»
6. sinking feeling → «ένα σφίξιμο στο στομάχι»; lowering your standards → «χαμηλώνετε τον πήχη»
7. "build momentum rather than burn out" → «να πάρετε φόρα αντί να εξαντληθείτε»
8. "Plan for slips" → «Σχεδιάστε για τις στραβές»
9. community repair group → «ομάδα της γειτονιάς που επισκευάζει αντικείμενα»

## el · emotional intelligence
1. trigger → «ερέθισμα» (matches existing catalog; «πυροδότης» or «αφορμή»?)
2. Respond vs react → «ανταπόκριση» vs «αντίδραση»
3. pause and choose → «παύση και επιλογή»
4. Jumping ahead → «Τρέχετε μπροστά»; Mind reading → «Διαβάζετε τη σκέψη των άλλων»
5. "stung" → «τσίμπημα»
6. bake sale → «παζάρι με σπιτικά γλυκά»
7. "I'm frazzled, give me a minute" → «Είμαι στα όριά μου, δώσε μου ένα λεπτό»
8. "Typical." → «Τα γνωστά.»
9. "No reply is not news" → «Το ότι δεν απαντά δεν σημαίνει κάτι κακό»
10. Names: Κόφι, Έλενα, Πρίγια, Τομάς, Γκρέις, Τζουν, Αμπντούλ, Ναόμι, Σοφία, Μάρκους

## el · communication
1. Reflecting back → «επαναδιατύπωση» (instead of counselling term «αντανάκλαση»)
2. "I'm all yours" → «είμαι όλος αυτιά» (male form)
3. "I" language → «σε πρώτο πρόσωπο»
4. Assertive → «διεκδικητικός / διεκδικητικότητα»
5. "Point, reason, next step" → «Σημείο, λόγος, επόμενο βήμα»
6. "stretched thin" → «είσαι ήδη πολύ πιεσμένος»; "stung a bit" → «με πείραξε λίγο»
7. "Communication styles" → «ύφη επικοινωνίας» (or «τρόποι επικοινωνίας»?)
8. "Does that make sense?" → «Βγάζει νόημα;»
9. "meet them halfway" → «να τον συναντήσετε στη μέση»
10. Names: Ντάνιελ, Πρίγια, Κουάμε, Σοφία, Χιρόσι, Λέιλα, Τομάς, Γκρέις, Άχμεντ, Ίνγκριντ, Σαμ
