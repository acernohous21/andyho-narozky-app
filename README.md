# Andyho Bojovka 🗡️

Narozeninová appka pro Andyho. Mobile-first, RPG feel, běží čistě v prohlížeči (žádný server, stav se ukládá do `localStorage` telefonu).

## Spuštění

```bash
npm install
npm run dev
```

Otevři `http://localhost:5173`. Na mobilu ve stejné WiFi použij IP notebooku (`npm run dev -- --host`).

## Jak to funguje

### Fáze I: příběh v autě
Interaktivní příběh (klepáním, volbami) proložený hlavolamy:

1. **Morseovka** – bliká a pípá, Andy vyluští „MŮJ OBLÍBENÝ KOLEGA“.
2. **Zámek na písmena** – otočí válce na TYGI.
3. 🔏 **Brána** – parta odemkne Kapitolu II v adminu.
4. **Programování** – klikací mini-interakce.
5. **Třesení** – zatřese telefonem 20× (akcelerometr, na iOS si vyžádá povolení; záložně klepání).
6. **Emoji rébus** – TYGI JEDE S NÁMI.
7. 🔏 **Brána** – parta odemkne Kapitolu IV.
8. **Přiřazovačka** – 3 kola (Želvy ninja, Scooby-Doo, Poslanecká sněmovna).
9. **Finále** – čekání s motokárovou minihrou, dokud parta neodemkne Fázi II.

Celý scénář je v `src/data/story.ts`. Texty, hlavolamy i postavy se dají přepsat bez sahání do komponent.

### Fáze II: questy
- **Draft**: Andy si vybere 4 lehké, 3 střední a 2 těžké (lze i „dolosovat“).
- **Jeden aktivní quest** naráz, splnění hodnotí parta 1–5 ⭐. Body = hvězdy × násobič (×1 / ×1,5 / ×2).
- **Série**: každé 3 splněné v řadě = +3 body. **Vzdání**: −2 body a trestný panák.
- **Žolíky** 1×: 🔄 Výměna (za úkol mimo draft), 🤝 Parťák (body ×0,75), 🛡️ Štít.
- **Levely**: Učeň → Panoš → Rytíř → Hrdina → Legenda (0 / 6 / 15 / 28 / 45 bodů).
- **Kronika** 📜 se statistikami.

## Admin konzole (pro partu)

Podrž **erb vlevo nahoře** cca 1 sekundu → PIN (výchozí `1234`). Funguje v obou fázích.

- **Fáze**: přepnutí I / II.
- **Příběh**: kde Andy je, „Odemknout další kapitolu“ (svítí zlatě, když na to Andy čeká), přeskočit krok, skok na kapitolu, reset příběhu.
- **Skóre, žolíky, questy**: korekce bodů, počty žolíků, ruční splnění / odsplnění, zrušení draftu, reset celé hry.

## Úpravy

| Co | Kde |
|---|---|
| Příběh, hlavolamy, postavy | `src/data/story.ts` |
| Seznam úkolů | `src/data/tasks.ts` |
| Jméno, PIN, násobiče, trest, bonusy, levely, počty v draftu, žolíky | `src/data/config.ts` |
| Barvy a fonty | `src/index.css` (`@theme`) |

Po změně dat doporučuju v adminu **Resetovat celou hru** (klíč `andyho-bojovka-v2` v localStorage).

## Nasazení

### GitHub Pages
1. Vytvoř repo, pushni do větve `main`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` nasadí build na `https://<uzivatel>.github.io/<repo>/`.

### Vercel / Netlify
Build command `npm run build`, output `dist`.

### Na plochu telefonu
PWA manifest: „Přidat na plochu“ → běží celoobrazovkově.

## Stack

Vite + React 19 + TypeScript, Tailwind CSS 4, Framer Motion, canvas-confetti. Zvuky přes Web Audio API (bez souborů), vibrace přes `navigator.vibrate` (Android), akcelerometr přes `devicemotion`.
