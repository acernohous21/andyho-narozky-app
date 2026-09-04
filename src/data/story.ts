/**
 * FÁZE I: interaktivní příběh.
 *
 * Každý prvek pole STORY je jeden „krok“ (obrazovka). Texty klidně přepisuj.
 * Typy kroků:
 *  - text      jedna obrazovka textu, Andy klepne „Dál“
 *  - choice    volba ze dvou tlačítek, každé může mít vlastní odpověď
 *  - morse     morseovka → napsat vyluštěnou větu
 *  - lock      zámek na písmena
 *  - tapwork   klikací mini-interakce (progress bar)
 *  - shake     zatřes telefonem N×
 *  - rebus     emoji rébus, slovo po slově
 *  - match     přiřazovačka party k postavám (více kol)
 *  - gate      brána, kterou musí odemknout parta v adminu
 *  - finale    konec Fáze I: čekání na Fázi II + minihra
 */

export type StoryStep =
  | { type: 'chapter'; title: string; subtitle?: string }
  | { type: 'text'; text: string; style?: 'normal' | 'shout' | 'whisper' | 'note'; effect?: 'shake' | 'confetti' | 'flash' | 'buzz' }
  | { type: 'choice'; prompt: string; options: { label: string; reply?: string }[] }
  | { type: 'morse'; intro: string; message: string; accept: string[]; success: string }
  | { type: 'lock'; intro: string; answer: string; success: string }
  | { type: 'tapwork'; title: string; button: string; count: number; quips: string[]; done: string }
  | { type: 'shake'; title: string; subtitle: string; count: number; done: string }
  | { type: 'rebus'; intro: string; words: { emoji: string; accept: string[]; answer: string }[]; success: string }
  | { type: 'match'; intro: string; rounds: MatchRound[]; success: string }
  | { type: 'gate'; title: string; text: string }
  | { type: 'finale'; title: string; text: string }

export interface MatchRound {
  title: string
  /** Postavy v pořadí zobrazení. `person` je správné jméno z PEOPLE. */
  characters: { name: string; icon: string; blurb: string; person: string }[]
}

export const HERO = 'Andy'
export const PEOPLE = ['Tom', 'David', 'Kuba', 'Adam', 'Andy'] as const

export const STORY: StoryStep[] = [
  // ---------- Kapitola 1: Ráno ----------
  { type: 'chapter', title: 'Kapitola I', subtitle: 'Ráno' },
  { type: 'text', text: 'Vstáváš.' },
  {
    type: 'text',
    text: 'Je krásné páteční ráno. Pátek 4. září. Tvoje narozeniny.',
  },
  {
    type: 'text',
    style: 'note',
    text: '(V tomhle vesmíru máš narozeniny 4. září. Nehledej v tom logiku, je to alternativní realita. Všechno ostatní je ale pravda.)',
  },
  { type: 'text', text: 'Jdeš na balkon. Slunce svítí, ptáčci zpívají, sousedka dole věší prádlo a dělá, že tě nevidí.' },
  {
    type: 'choice',
    prompt: 'Co uděláš?',
    options: [
      { label: 'Nadechnu se čerstvého vzduchu', reply: 'Krásný den. Zatím.' },
      { label: 'Zapálím si', reply: 'Klasika. Krásný den. Zatím.' },
    ],
  },
  { type: 'text', text: 'Bzzz. Bzzz.', style: 'shout', effect: 'buzz' },
  { type: 'text', text: 'Přišla zpráva na mobil.' },
  { type: 'text', text: 'Ještě než ji otevřeš, zalije tě studený pot. Pátek ráno. Tohle nikdy nevěstí nic dobrého.' },
  { type: 'text', text: 'Podíváš se, kdo píše.' },
  {
    type: 'text',
    text: 'Jenže displej je rozbitý. (Včera jsi ho pustil na záchodě. Nepamatuješ si to.) Jméno odesílatele se místo písmen ukazuje jako… tečky a čárky?',
  },
  {
    type: 'morse',
    intro: 'Rozbitý displej bliká a pípá. Vylušti, co je tam napsáno.',
    message: 'MUJ OBLIBENY KOLEGA',
    accept: ['muj oblibeny kolega', 'oblibeny kolega', 'muj oblibeny'],
    success: 'MŮJ OBLÍBENÝ KOLEGA',
  },
  { type: 'text', text: 'Můj oblíbený kolega… Sakra. Ty víš, kdo to je. Všichni to ví.' },
  {
    type: 'lock',
    intro: 'Zpráva je zamčená. Zadej jméno odesílatele.',
    answer: 'TYGI',
    success: 'Zámek cvakl.',
  },
  { type: 'text', text: 'JE TO TYGI!!!', style: 'shout', effect: 'flash' },
  { type: 'gate', title: 'Pečeť I zlomena', text: 'Parta musí odemknout další kapitolu.' },

  // ---------- Kapitola 2: Meeting ----------
  { type: 'chapter', title: 'Kapitola II', subtitle: 'Meeting' },
  { type: 'text', text: 'Tygi: „Čau brácho, máš 5 minut? Potřeboval bych s tebou rychle meeting.“' },
  { type: 'text', text: 'Zase něco posral.' },
  {
    type: 'choice',
    prompt: 'Co odpovíš?',
    options: [
      { label: 'Jasně, hned se připojím', reply: 'Tygi: „Díky brácho, jsi nejlepší.“' },
      { label: 'Mám narozeniny, Tygi', reply: 'Tygi: „Super, gratuluju! Tak se připojíš?“ …Připojíš se.' },
    ],
  },
  { type: 'text', text: 'Připojuješ se na meeting. Tygi sdílí obrazovku.' },
  { type: 'text', text: 'Zjišťuješ, že Tygi opět neumí programovat.' },
  { type: 'text', text: 'Vaří se mu mozek. Vidíš to na kameře. Doslova.' },
  { type: 'text', text: 'A tak to za něj děláš ty. Jako vždycky.' },
  {
    type: 'tapwork',
    title: 'Programuješ a programuješ…',
    button: 'Napsat řádek kódu',
    count: 15,
    quips: [
      'Tygi: „Jo, přesně to jsem chtěl napsat.“',
      'Tygi: „A co dělá ten středník?“',
      'Tygi: „Můžu si odskočit?“',
      'Tygi: „Já bych to udělal stejně, jen jinak.“',
      'Tygi: „Funguje to? Ne? Tak to jsem nebyl já.“',
    ],
    done: 'Makáš za něj. Jako vždycky.',
  },
  { type: 'text', text: 'Najednou ti do callu vpadne Kelly.' },
  { type: 'text', text: 'Kelly: „Chlapi, já vám s tím pomůžu.“' },
  { type: 'text', text: 'Poprvé za svoji kariéru udělal Kelly nějakou práci.' },
  { type: 'text', text: 'Pomohl. Funguje to. Nikdo neví jak.' },
  { type: 'text', text: 'Loučíš se s Tygim. Tygi: „Díky brácho, příště to zvládnu sám.“ (Nezvládne.)' },
  { type: 'text', text: 'Koukáš na hodiny. Jsou 3 odpoledne. Vypínáš PC.' },
  { type: 'text', text: 'Máš z toho nerva.' },
  {
    type: 'choice',
    prompt: 'Co uděláš?',
    options: [{ label: 'Jdu si vyhonit' }, { label: 'Jdu si vyhonit' }],
  },
  {
    type: 'shake',
    title: 'Dostaň to ze sebe.',
    subtitle: 'Zatřes telefonem. Pořádně.',
    count: 20,
    done: 'Dostal jsi to ze sebe.',
  },
  { type: 'text', text: 'Jdeš si umýt ruce.' },
  { type: 'text', text: 'Ale v tom někdo zazvoní.', effect: 'buzz' },

  // ---------- Kapitola 3: Překvapení ----------
  { type: 'chapter', title: 'Kapitola III', subtitle: 'Překvapení' },
  { type: 'text', text: 'Zvedneš telefon u dveří.' },
  {
    type: 'choice',
    prompt: 'Co řekneš?',
    options: [
      { label: 'HALÓÓÓ', reply: 'Ozve se…' },
      { label: 'Kdo je?', reply: 'Ozve se…' },
    ],
  },
  { type: 'text', text: 'PŘEKVAPENÍÍÍÍÍ!', style: 'shout', effect: 'confetti' },
  { type: 'text', text: 'Jsou to Tom, Adam, David a Kuba.' },
  { type: 'text', text: 'Máš narozeninovou oslavu.' },
  { type: 'text', text: 'Pozveš je nahoru. Zdravíte se.' },
  { type: 'text', text: 'Dáváš plácáka Tomovi.' },
  { type: 'text', text: 'Tom: „Proč máš tak oslizlou ruku?“' },
  {
    type: 'choice',
    prompt: 'Co řekneš?',
    options: [
      { label: 'Právě jsem vařil puding', reply: 'Tom: „Aha. Jasně. Puding.“' },
      { label: 'Mydlil jsem se', reply: 'Tom: „Bez vody?“ Rychle to zachráníš: „…a vařil puding.“' },
    ],
  },
  { type: 'text', text: 'Nechceš být nezdvořilý, a tak Tomovi nabídneš puding.' },
  { type: 'text', text: '„Dáš si?“' },
  { type: 'text', text: 'Tom: „Jasně, umírám hlady.“' },
  { type: 'text', text: 'David s Kubou: „Na puding nemáme čas.“' },
  { type: 'text', text: '„Oblíkni si kalhoty. Máme pro tebe překvapení.“' },
  {
    type: 'text',
    text: 'Oblékáš si kalhoty. Konečně si umyješ ruce. (Podal jsi Ekymu ruku od mrdky, ty prase!!!)',
  },
  { type: 'text', text: 'Balíš si anti-ethanol. Nasedáte do auta.' },
  { type: 'text', text: 'Zeptáš se: „Kam jedeme???“' },
  { type: 'text', text: 'David odpoví:' },
  {
    type: 'rebus',
    intro: 'David mluví jen v emoji. Přelož ho, slovo po slově.',
    words: [
      { emoji: '🐯', accept: ['tygi', 'tigi', 'tyggi'], answer: 'TYGI' },
      { emoji: '🚗', accept: ['jede', 'pojede'], answer: 'JEDE' },
      { emoji: '👥', accept: ['s nami', 'snami', 's náma', 's nama', 'snama'], answer: 'S NÁMI' },
    ],
    success: 'TYGI JEDE S NÁMI',
  },
  { type: 'text', text: '…', style: 'whisper' },
  { type: 'text', text: 'Ne. To ne. Cokoliv, jen ne to.' },
  { type: 'gate', title: 'Pečeť II zlomena', text: 'Parta musí odemknout další kapitolu.' },

  // ---------- Kapitola 4: Kam jedeme ----------
  { type: 'chapter', title: 'Kapitola IV', subtitle: 'Kam jedeme' },
  { type: 'text', text: 'Byl jsi nabaiten. Tygi zůstává doma. (Zatím.)' },
  { type: 'text', text: 'Ale už ti začíná být jasné, kam jedete. Koukáš z okna, sledujete Berounku…' },
  { type: 'text', text: 'Tak říkáš: „Nejedeme náhodou na…“' },
  { type: 'text', text: 'Kuba: „Nejdřív nám dokaž, že nás vůbec znáš.“' },
  {
    type: 'match',
    intro: 'Přiřaď každého z party ke správné postavě. Klepni na postavu, pak na jméno.',
    rounds: [
      {
        title: 'Želvy ninja',
        characters: [
          { name: 'Leonardo', icon: '🐢', blurb: 'Zodpovědný leader party. Modrá páska.', person: 'Andy' },
          { name: 'Donatello', icon: '🔬', blurb: 'Ten chytrý. Fialová páska, tyč, mozek.', person: 'Tom' },
          { name: 'Rafael', icon: '😎', blurb: 'Nonšalantní sigma. Červená páska.', person: 'Kuba' },
          { name: 'Michelangelo', icon: '🍕', blurb: '„Hell nah man. Ale pizzu mám rád.“', person: 'Adam' },
          { name: 'Mistr Tříska', icon: '🐀', blurb: 'Krysa. Moudrá. Krysa.', person: 'David' },
        ],
      },
      {
        title: 'Poslanecká sněmovna',
        characters: [
          { name: 'Eminem', icon: '🎤', blurb: 'Není politik. Ale kdo z nás je.', person: 'Andy' },
          { name: 'Tomio Okamura', icon: '🗾', blurb: 'Netřeba komentář.', person: 'Tom' },
          { name: 'Andrej Babiš', icon: '🧢', blurb: '„Sorry jako.“', person: 'Adam' },
          { name: 'Petr Macinka', icon: '🛞', blurb: 'Motorista. Zatím bez auta.', person: 'Kuba' },
          { name: 'Filip Turek', icon: '🏎️', blurb: 'Motorista. S autem. S několika.', person: 'David' },
        ],
      },
    ],
    success: 'Znáš nás. Bohužel.',
  },
  { type: 'text', text: 'Ne, ne, ne. Nedozvíš se, kam jedeme.', style: 'shout' },
  {
    type: 'choice',
    prompt: '',
    options: [
      { label: 'Tak kam???', reply: 'Tom: „Fajn. Řekneme ti to. Ale ne přes appku.“' },
      { label: 'TAK KAM???', reply: 'Tom: „Fajn. Řekneme ti to. Ale ne přes appku.“' },
    ],
  },
  {
    type: 'finale',
    title: 'Pečeť III zlomena',
    text: 'Parta ti to řekne osobně. Fáze II se odemkne, až přijde čas. Zatím si zatrénuj.',
  },
]

/** Index kroku, kde začíná každá kapitola (pro admin „skočit na kapitolu“). */
export const CHAPTER_STARTS: { title: string; step: number }[] = STORY.map((s, i) =>
  s.type === 'chapter' ? { title: `${s.title}${s.subtitle ? ': ' + s.subtitle : ''}`, step: i } : null,
).filter((x): x is { title: string; step: number } => x !== null)

/** Pořadové číslo brány pro krok (0 = první gate ve scénáři). */
export function gateOrdinal(stepIndex: number): number {
  let n = 0
  for (let i = 0; i < stepIndex; i++) if (STORY[i].type === 'gate') n++
  return n
}

export const GATE_COUNT = STORY.filter((s) => s.type === 'gate').length

/** Kolik bran je potřeba mít odemčených, aby se dalo dostat na krok `stepIndex`. */
export function gatesNeededFor(stepIndex: number): number {
  return gateOrdinal(stepIndex)
}
