import type { Task } from '../types'

/**
 * Seznam úkolů. Stačí přidat / upravit řádek.
 * id musí být unikátní (používá se pro ukládání progresu).
 */
export const TASKS: Task[] = [
  // 🟢 Lehké
  { id: 'e01', difficulty: 'easy', text: 'Zeptej se náhodného kolemjdoucího na cestu na místo, kde právě stojíš.' },
  { id: 'e02', difficulty: 'easy', text: 'Objednej si pivo vymyšleným přízvukem a celou objednávku dodrž v tom přízvuku.' },
  { id: 'e03', difficulty: 'easy', text: 'Řekni cizímu člověku, že vypadá jako celebrita. Vyber někoho, komu se vůbec nepodobá.' },
  { id: 'e04', difficulty: 'easy', text: 'Nech si od cizího člověka podepsat tričko nebo papírek jako „autogram“.' },
  { id: 'e05', difficulty: 'easy', text: 'Zeptej se někoho, jestli tě může vyfotit. Po fotce mu řekni, že je to tvoje nová profilovka.' },
  { id: 'e06', difficulty: 'easy', text: 'Zahraj mini-scénku (naschvál trapnou) před vchodem do Levels.' },
  { id: 'e07', difficulty: 'easy', text: 'Nech si od cizího člověka vybrat, co si dáš k pití nebo jídlu.' },
  { id: 'e08', difficulty: 'easy', text: 'Zeptej se někoho: „Můžu ti položit jednu extrémně důležitou otázku?“ A pak se zeptej, jestli má radši kečup nebo hořčici.' },
  { id: 'e09', difficulty: 'easy', text: 'Přesvědč někoho, aby ti dal hodnocení tvého outfitu od 1 do 10.' },
  { id: 'e10', difficulty: 'easy', text: 'Mystery shot namíchaný partou. Sám nesmíš vědět, co piješ.' },

  // 🟡 Střední
  { id: 'm01', difficulty: 'medium', text: 'Oslovuj číšníka nebo barmana „šampione“ při každé objednávce.' },
  { id: 'm02', difficulty: 'medium', text: 'Zeptej se někoho, jestli tě může naučit jeden taneční pohyb. Pak ho musíš předvést před dalšími lidmi.' },
  { id: 'm03', difficulty: 'medium', text: 'Tanči 1 minutu na frekventovaném místě.' },
  { id: 'm04', difficulty: 'medium', text: 'Nech si namalovat obličej nebo nalepit nálepky či tetování. Nesundávat do konce dne.' },
  { id: 'm05', difficulty: 'medium', text: 'Oslov bránu jako „promotér“ a rozdávej smyšlené vizitky kolemjdoucím.' },
  { id: 'm06', difficulty: 'medium', text: 'Zavolej mámě nebo tátovi a odehraj scénář, který ti vymyslíme.' },
  { id: 'm07', difficulty: 'medium', text: 'Během večera nasbírej 5 různých lidí, kteří ti dají jeden tip do života.' },
  { id: 'm08', difficulty: 'medium', text: 'Vyfoť si cizího člověka a nastav si ho jako lock-screen. Pak ho požádej, aby on vyfotil tebe.' },
  { id: 'm09', difficulty: 'medium', text: 'Kup 3 lahváče a rozdej je bezdomovcům.' },
  { id: 'm10', difficulty: 'medium', text: 'Kup si v obchodě věc za 10 Kč a vyměň ji za co nejlepší věc. Aspoň 3 výměny.' },
  { id: 'm11', difficulty: 'medium', text: 'Udělej uzlíček na špagetě.' },

  // 🔴 Těžké
  { id: 'h01', difficulty: 'hard', text: 'Přesvědč týpka na hajzlech, že pokud si myje ruce, tak souhlasí s tím, že mu smrdí péro.' },
  { id: 'h02', difficulty: 'hard', text: 'Karaoke: jedna písnička v Levels nebo v baru. Nebo si půjč mikrofon od pouličního interpreta.' },
  { id: 'h03', difficulty: 'hard', text: 'Prohra v arkádě nebo minigolfu: po zbytek hodiny nosíš směšný doplněk.' },
  { id: 'h04', difficulty: 'hard', text: 'Vyzvi cizí stůl v hospodě na páku, šipky, fotbálek, karty nebo piškvorky o rundu.' },
  { id: 'h05', difficulty: 'hard', text: 'Skoč do vody nebo si smoč nohy ve fontánce.' },
  { id: 'h06', difficulty: 'hard', text: 'Troll jukebox.' },
]

export const TASK_BY_ID: Record<string, Task> = Object.fromEntries(TASKS.map((t) => [t.id, t]))
