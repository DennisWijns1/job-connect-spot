
# Plan: Kleuraanpassingen en AI Response Schema Update

## Samenvatting
Dit plan bevat twee hoofdonderdelen:
1. **Kleurenaanpassingen**: Zachte abrikoos-kleur voor grote oppervlakken, fellere kleur alleen voor details
2. **AI Response Schema Update**: Het nieuwe, meer gedetailleerde JSON schema implementeren

---

## Deel 1: Kleurenaanpassingen

### Wat gaat er veranderen?

**Huidige situatie:**
- `--secondary` (grote oppervlakken): `30 50% 94%` - te licht
- `--accent` (details): `24 95% 61%` - fel abrikoos

**Nieuwe situatie:**
- **Zachte abrikoos voor grote oppervlakken** (nav bar, hover states, suggestion cards):
  - Iets donkerder dan nu: `28 45% 90%` (warmer, zichtbaarder, maar nog steeds zacht)
  
- **Felle abrikoos alleen voor kleine details** (iconen, kleine badges, CTA knoppen):
  - Behouden: `24 95% 61%`

### Bestanden die aangepast worden:

**1. `src/index.css`**
- `--secondary`: `28 45% 90%` (1 tint donkerder, zachte abrikoos)
- Nieuwe variabele `--secondary-soft`: voor hover states

**2. `src/components/BottomNav.tsx`**
- Achtergrond blijft `bg-secondary` (nu zachter abrikoos)
- Active/hover states aanpassen naar zachtere tint

**3. `src/pages/AIHelpPage.tsx`**
- Suggestion cards hover: `hover:bg-secondary` i.p.v. harde kleur
- Dit is al correct: de "Lamp flikkert constant" cards hebben de juiste zachte kleur

---

## Deel 2: AI Response Schema Update

### Nieuw JSON Schema
Het nieuwe schema bevat meer gestructureerde data:

```text
+--------------------------------------------------+
|  NIEUW VELD           |  BESCHRIJVING            |
+--------------------------------------------------+
|  title                |  Korte titel voor topic   |
|  step_plan[]          |  step/title/instruction   |
|  tools[]              |  name/required/note       |
|  materials[]          |  name/required/note       |
|  stop_conditions[]    |  condition/reason/action  |
|  escalation           |  when_to_escalate/...     |
|  disclaimer           |  short/safety_note        |
+--------------------------------------------------+
```

Dit schema is **al geïmplementeerd** in:
- `src/types/ai-response.ts`
- `supabase/functions/ai-assist/index.ts`
- `src/components/ai/AIResponseCard.tsx`

**Geen wijzigingen nodig** - het schema dat je deelde komt exact overeen met wat al gebouwd is!

---

## Technische Details

### CSS Wijzigingen (`src/index.css`)

```css
/* VAN: */
--secondary: 30 50% 94%;

/* NAAR: */
--secondary: 28 45% 90%;
```

De lightness gaat van 94% naar 90% = 1 tint donkerder, maar nog steeds zacht.

### BottomNav Wijzigingen

De bottom nav gebruikt al `bg-secondary`, dus deze krijgt automatisch de nieuwe zachte abrikoos kleur. Hover states worden aangepast:

- Active state: `bg-primary/15` (petrol accent)
- Hover state: `bg-secondary/80` (zachte abrikoos)

### AIHelpPage Suggestion Cards

De suggestion cards krijgen:
- Default: `bg-card` (crème)
- Hover: `bg-secondary` (zachte abrikoos - de kleur die je mooi vond!)

---

## Resultaat na implementatie

| Element | Kleur |
|---------|-------|
| Bottom nav bar | Zachte abrikoos (`#EBE3D8` ≈) |
| Suggestion cards hover | Zachte abrikoos |
| Card hover states | Zachte abrikoos |
| CTA knoppen | Felle abrikoos (#FB923C) |
| Iconen | Felle abrikoos |
| Kleine accenten | Felle abrikoos |

Dit zorgt voor het gewenste effect: grote oppervlakken zijn warm maar rustig, details springen eruit met de fellere kleur.
