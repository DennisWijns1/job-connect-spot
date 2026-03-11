

# Plan: Dynamische Interactieve Tutorial voor Elk Probleem

## Overzicht

In plaats van een hardcoded tutorial voor "lekkende kraan", wordt er een dynamisch tutorialsysteem gebouwd dat werkt voor **elk probleem** dat de AI analyseert. De AI genereert de tutorial-data (gedetailleerde stappen met tips, gereedschap en uitleg), en een herbruikbare tutorial-pagina rendert dit interactief.

---

## Hoe het werkt

```text
Gebruiker stelt vraag in AI Klushulp
            |
            v
AI geeft analyse terug (bestaand)
            |
            v
CTA: "Bekijk stap-voor-stap tutorial"
            |
            v
Klik -> Nieuwe request naar edge function
        met: "Genereer tutorial voor [probleem]"
            |
            v
AI retourneert tutorial_steps[] met:
  - titel, beschrijving, tip, gereedschap, risico
            |
            v
Dynamische TutorialPage rendert:
  - Voortgangsbalk
  - Stappen met iconen
  - Uitklapbare "Meer weten?" secties
  - Afvinkbare checkboxes
  - Gereedschap overzicht
  - Escalatie CTA onderaan
```

---

## Wijzigingen

### 1. Edge Function: `supabase/functions/ai-assist/index.ts`

**Nieuw request type**: `mode: "tutorial"`

Wanneer de frontend een tutorial opvraagt, stuurt het:
```json
{
  "userType": "seeker",
  "message": "Kraan lekt water",
  "mode": "tutorial",
  "category": "Sanitair",
  "riskLevel": "GREEN"
}
```

De edge function gebruikt een aparte system prompt die de AI instrueert om een array van gedetailleerde tutorial-stappen te retourneren:

```json
{
  "tutorial_title": "Lekkende kraan repareren",
  "tutorial_category": "Sanitair",
  "risk_level": "GREEN",
  "estimated_duration": "30 minuten",
  "tools_needed": ["Verstelbare moersleutel", "Nieuw kraanleertje", "Doek"],
  "materials_needed": ["Kraanleertje (juiste maat)", "Teflontape"],
  "steps": [
    {
      "title": "Sluit de hoofdkraan af",
      "description": "Draai de hoofdkraan dicht onder de gootsteen of in de meterkast.",
      "tip": "Laat daarna de kraan even openstaan zodat restwater kan weglopen.",
      "risk_level": "GREEN",
      "detailed_explanation": "De hoofdkraan bevindt zich meestal..."
    }
  ],
  "when_to_stop": "Als je twijfelt of water niet stopt na afsluiten.",
  "disclaimer": "..."
}
```

**Implementatie:**
- Check voor `mode` veld in request body
- Als `mode === "tutorial"`: gebruik een tutorial-specifieke system prompt
- Valideer en fix de tutorial response net als bij de standaard response
- Retourneer als `{ ok: true, tutorial: validatedTutorial }`

### 2. Nieuwe pagina: `src/pages/TutorialPage.tsx`

Een **generieke, herbruikbare** tutorial pagina die werkt voor elk probleem.

**Hoe data wordt doorgegeven:**
- Via React Router state: `navigate('/tutorial', { state: { problem, category, riskLevel } })`
- De pagina doet zelf een fetch naar de edge function met `mode: "tutorial"`

**Componenten op de pagina:**
- Header met tutorial titel
- Voortgangsbalk (X van Y stappen voltooid)
- Gereedschap en materialen sectie (collapsible)
- Per stap:
  - Nummer + titel + risico-badge
  - Beschrijving
  - Accordion "Meer weten?" met gedetailleerde uitleg
  - Optionele tip-blok
  - Checkbox om stap als voltooid te markeren
- Navigatieknoppen (Vorige / Volgende)
- Escalatie CTA onderaan: "Lukt het niet? Schakel een Handy in"

**State management:**
- `completedSteps: Set<number>` - lokaal bijgehouden met useState
- `activeStep: number` - huidige stap in focus
- `tutorialData: TutorialData | null` - opgehaalde data van AI
- `isLoading: boolean` - laadstatus

### 3. Aanpassing: `src/pages/AIHelpPage.tsx`

**Nieuwe CTA knop** in `renderAIResponse`:

Bij elke AI response waar `understood === true` en `risk_level !== 'RED'` en er `suggested_steps` zijn, toon een extra knop:

```
"Bekijk interactieve tutorial"
```

Deze knop navigeert naar `/tutorial` met het probleem, de categorie en het risiconiveau als route state.

Dit werkt voor **elk probleem** - niet alleen sanitair of lekkende kraan.

### 4. Route: `src/App.tsx`

Nieuwe route toevoegen:
```
<Route path="/tutorial" element={<TutorialPage />} />
```

---

## Technische Details

### Bestanden

| Bestand | Actie |
|---------|-------|
| `supabase/functions/ai-assist/index.ts` | Tutorial mode toevoegen |
| `src/pages/TutorialPage.tsx` | Nieuw - dynamische tutorial pagina |
| `src/pages/AIHelpPage.tsx` | CTA knop toevoegen |
| `src/App.tsx` | Route toevoegen |

### Tutorial data interface

```typescript
interface TutorialStep {
  title: string;
  description: string;
  tip: string | null;
  risk_level: 'GREEN' | 'YELLOW';
  detailed_explanation: string;
}

interface TutorialData {
  tutorial_title: string;
  tutorial_category: string;
  risk_level: 'GREEN' | 'YELLOW' | 'RED';
  estimated_duration: string;
  tools_needed: string[];
  materials_needed: string[];
  steps: TutorialStep[];
  when_to_stop: string;
  disclaimer: string;
}
```

### Tutorial system prompt (samenvatting)

De AI krijgt instructie om:
- Maximaal 7 stappen te genereren (seeker: eenvoudig, handy: technisch)
- Per stap een tip en gedetailleerde uitleg te geven
- Benodigde gereedschap en materialen op te sommen
- Risico per stap te beoordelen
- Een duidelijke stopconditie te geven

---

## Resultaat

1. Gebruiker stelt **elk willekeurig** klusprobleem in de AI Klushulp
2. AI analyseert en toont het stappenplan (bestaand)
3. Nieuwe CTA: "Bekijk interactieve tutorial"
4. Klik -> Tutorial pagina laadt met AI-gegenereerde stappen
5. Gebruiker ziet: gereedschap, materialen, gedetailleerde stappen
6. Per stap: uitklapbare extra uitleg, tips, afvinkbaar
7. Voortgangsbalk toont hoever de gebruiker is
8. Bij twijfel: CTA om een Handy in te schakelen

