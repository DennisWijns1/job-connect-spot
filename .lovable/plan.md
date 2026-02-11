

# Plan: Camera + AI Vision Analyse Implementatie

## Overzicht

De camera-knop in de AI Klushulp werkt momenteel niet (toont alleen een toast). Dit plan implementeert volledige foto-upload, AI Vision analyse met visual markers, en SVG overlay rendering.

---

## Wijzigingen

### 1. Edge Function: `supabase/functions/ai-assist/index.ts`

**Wat verandert:**
- Accept `photo` (base64 string) in request body naast `message`
- Stuur foto als multimodal content naar Gemini (image_url met base64 data URI)
- Voeg `visual_markers` toe aan het verplichte JSON-schema in de system prompt
- Update `AIResponse` interface en `validateAndFixResponse` met `visual_markers`
- Update `FALLBACK_RESPONSE` met leeg `visual_markers` array

**Nieuw request formaat:**
```json
{
  "userType": "seeker",
  "message": "Mijn kraan lekt",
  "photo": "base64_encoded_image_data",
  "categoryHint": null
}
```

**Multimodal message opbouw:**
Wanneer `photo` aanwezig is, wordt de user message een array van content parts:
```json
[
  { "type": "text", "text": "beschrijving + context" },
  { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
]
```

**Extra JSON-veld in system prompt:**
```json
"visual_markers": [
  {
    "type": "circle" | "arrow",
    "x": 0.0-1.0,
    "y": 0.0-1.0,
    "radius": number | null,
    "direction": "up" | "down" | "left" | "right" | null
  }
]
```

---

### 2. Frontend: `src/pages/AIHelpPage.tsx`

**Wat verandert:**

**a) Camera/foto functionaliteit:**
- Hidden `<input type="file" accept="image/*" capture="environment">` element
- Camera knop onClick triggert dit input element
- Op mobiel opent dit de native camera, op desktop de file picker
- Na selectie: lees bestand als base64 via `FileReader`
- Sla base64 + preview URL op in state (`photoBase64`, `photoPreview`)
- Toon kleine preview thumbnail naast de input wanneer foto geselecteerd is
- Verwijder-knop (X) om foto te annuleren

**b) Versturen met foto:**
- `handleSend` stuurt `photo: photoBase64` mee in request body wanneer aanwezig
- User message toont de foto-preview in de chat bubble
- Na verzenden: reset `photoBase64` en `photoPreview`

**c) Message interface uitbreiden:**
- Voeg `photoUrl?: string` toe aan `Message` interface
- Voeg `visual_markers` toe aan `AIResponse` interface

**d) SVG Overlay rendering:**
- Nieuw `renderPhotoWithOverlay` functie
- Toont de afbeelding in een `<div style="position: relative">`
- Rendert `<svg>` overlay met viewBox="0 0 1 1" (genormaliseerde coordinaten)
- Voor `circle` markers: `<circle>` op (x, y) met radius, rode stroke
- Voor `arrow` markers: `<line>` met pijlpunt in opgegeven richting
- SVG schaalt mee met de afbeelding via `preserveAspectRatio`

**e) Rendering in `renderAIResponse`:**
- Controleer of het bericht een foto bevat en AI `visual_markers` heeft teruggegeven
- Render `renderPhotoWithOverlay` boven het stappenplan
- Bij `vision_confidence === 'low'`: toon melding om nieuwe foto te sturen, geen stappen

---

## Technische Details

### Bestanden te wijzigen

| Bestand | Wijziging |
|---------|-----------|
| `supabase/functions/ai-assist/index.ts` | Multimodal support, visual_markers in schema |
| `src/pages/AIHelpPage.tsx` | Camera input, foto state, overlay rendering |

### AIResponse interface update

```typescript
interface VisualMarker {
  type: 'circle' | 'arrow';
  x: number;
  y: number;
  radius: number | null;
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

interface AIResponse {
  // ... bestaande velden ...
  visual_markers: VisualMarker[];
}
```

### Camera flow

```text
[Camera icoon] --> <input type="file" accept="image/*" capture="environment">
      |
      v
FileReader.readAsDataURL(file)
      |
      v
State: photoBase64, photoPreview
      |
      v
[Preview thumbnail naast input] [X knop]
      |
      v
handleSend() --> POST { message, photo: base64, userType }
      |
      v
Edge Function --> Gemini multimodal --> JSON + visual_markers
      |
      v
renderPhotoWithOverlay() --> SVG circles/arrows op foto
```

### SVG Overlay structuur

```text
┌──────────────────────────────┐
│  <div position: relative>    │
│  ┌──────────────────────────┐│
│  │ <img src={photo} />      ││
│  │                          ││
│  │   ○ (circle marker)      ││
│  │        ↓ (arrow marker)  ││
│  │                          ││
│  └──────────────────────────┘│
│  <svg position: absolute     │
│   top:0 left:0 100% x 100%> │
│   viewBox="0 0 1 1"         │
│  </svg>                     │
│  </div>                     │
└──────────────────────────────┘
```

---

## Resultaat

1. Gebruiker klikt camera-icoon -> native camera (mobiel) of file picker (desktop) opent
2. Foto wordt geconverteerd naar base64 en als preview getoond
3. Bij verzenden gaat foto + tekst naar de edge function
4. Gemini analyseert de foto multimodaal
5. AI response bevat visual_markers met genormaliseerde coordinaten
6. Foto wordt getoond met SVG overlay (rode cirkels/pijlen)
7. Stappenplan verschijnt onder de foto, aangepast aan seeker/handy profiel
8. Bij RED risico: geen stappen, alleen escalatie
9. Bij confidence = low: vraag om betere foto

