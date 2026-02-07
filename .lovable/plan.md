
# Plan: Afspraak in Agenda Zetten + Zoekfilters voor Quick Chat & Kaart

## Overzicht

Er worden twee functionaliteiten toegevoegd:
1. **Afspraak naar agenda toevoegen** - Wanneer een datum/tijd in de chat wordt voorgesteld, kan de gebruiker dit direct in de agenda zetten
2. **Zoekfilters voor Quick Chat & Kaart** - Het vergrootglas-icoon toevoegen zodat gebruikers kunnen filteren op afstand, specialiteit, etc.

---

## Deel 1: Afspraak in Agenda Zetten

### Wat er gebeurt nu
- In de chat verschijnt een bericht met `isAppointmentRequest: true`
- De knop "Afspraak bevestigen" toont alleen een toast melding
- Er wordt niks opgeslagen of toegevoegd aan de agenda

### Nieuwe flow

```text
┌─────────────────────────────────────┐
│  Handy stuurt bericht:              │
│  "Ik kan morgen om 14u langskomen"  │
│  ┌─────────────────────────────────┐│
│  │ 📅 Afspraak bevestigen          ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  📅 Afspraak Toevoegen              │
│                                     │
│  Met: Jan De Smedt                  │
│                                     │
│  Datum:  [Calendar picker]          │
│  Tijd:   [10:00] - [11:00]          │
│  Locatie: [________________]        │
│  Notitie: [________________]        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ✓ Toevoegen aan agenda          ││
│  └─────────────────────────────────┘│
│                                     │
│  Exporteren naar:                   │
│  [Google] [Apple/Outlook]           │
└─────────────────────────────────────┘
```

### Componenten

**1. Nieuwe component: `AddToCalendarSheet.tsx`**

Een sheet dialog met:
- Participant naam (Handy waarmee je chat)
- Date picker voor datum
- Time pickers voor start- en eindtijd
- Optionele locatie en notitie velden
- "Toevoegen aan agenda" knop
- Export knoppen voor Google Calendar en Apple/Outlook (ICS)

**2. Aanpassing `ChatDetailPage.tsx`**
- State toevoegen voor de AddToCalendarSheet
- `handleAppointment` functie aanpassen om de sheet te openen
- Afspraakgegevens doorgeven (participant naam, voorgestelde tijd indien beschikbaar)

---

## Deel 2: Zoekfilters voor Quick Chat & Kaart

### Wat er nu is
- **SwipePage** heeft het `SwipeHeader` component met een zoek-icoon dat `ProblemInputDialog` opent
- **QuickChatPage** en **MapPage** gebruiken de standaard `Header` component zonder zoekfilter

### Nieuwe situatie

Beide pagina's krijgen een zoek/filter knop in de header die dezelfde `ProblemInputDialog` opent (of vergelijkbare filter modal).

### Visuele vergelijking

```text
NU:                                    NA:
┌─────────────────────────────┐       ┌─────────────────────────────┐
│ ← HM Quick Chat             │       │ ← HM Quick Chat    [🔍]    │
├─────────────────────────────┤       ├─────────────────────────────┤
│ Beschikbare Handy's         │       │ Beschikbare Handy's         │
│ ...                         │       │ ...                         │
└─────────────────────────────┘       └─────────────────────────────┘

┌─────────────────────────────┐       ┌─────────────────────────────┐
│ ★ HM Kaart                  │       │ ★ HM Kaart          [🔍]   │
├─────────────────────────────┤       ├─────────────────────────────┤
│ [Map content]               │       │ [Map content]               │
└─────────────────────────────┘       └─────────────────────────────┘
```

---

## Technische Wijzigingen

### Nieuwe bestanden

| Bestand | Beschrijving |
|---------|--------------|
| `src/components/AddToCalendarSheet.tsx` | Sheet voor afspraak toevoegen aan agenda |

### Aan te passen bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/ChatDetailPage.tsx` | AddToCalendarSheet integreren, handleAppointment aanpassen |
| `src/pages/QuickChatPage.tsx` | Header aanpassen met `showSearch`, filter state & modal toevoegen |
| `src/pages/MapPage.tsx` | Header aanpassen met `showSearch`, filter state & modal toevoegen |

---

## Implementatie Details

### AddToCalendarSheet component

```typescript
interface AddToCalendarSheetProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  onConfirm: (appointment: AppointmentData) => void;
}

interface AppointmentData {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
}
```

Features:
- Calendar date picker (Shadcn Calendar component)
- Time inputs voor start en eind
- Google Calendar URL generator (hergebruik van CalendarSection)
- ICS download functie (hergebruik van CalendarSection)
- Opslaan in lokale state/mock data

### QuickChatPage aanpassingen

1. Header props toevoegen:
```typescript
<Header 
  title="Quick Chat" 
  showBack 
  showSearch 
  onOpenSearch={() => setShowFilterModal(true)} 
/>
```

2. State voor filter modal:
```typescript
const [showFilterModal, setShowFilterModal] = useState(false);
```

3. Filter functie voor beschikbare handys:
```typescript
const handleFilter = (filters) => {
  // Filter availableHandys op basis van afstand, rating, specialiteit
};
```

### MapPage aanpassingen

Dezelfde structuur als QuickChatPage:
- `showSearch` prop toevoegen aan Header
- State voor filter modal
- Filter logica voor handyLocations of projectLocations

---

## Resultaat

Na implementatie:

1. **Chat afspraken**:
   - Klik op "Afspraak bevestigen" in chat
   - Sheet opent met datum/tijd selector
   - Kies datum en tijden
   - Voeg toe aan lokale agenda OF exporteer naar Google/Apple

2. **Zoekfilters**:
   - Op Quick Chat en Kaart verschijnt het vergrootglas-icoon
   - Klikken opent dezelfde filter modal als bij Swipe
   - Filteren op afstand, specialiteit, rating, uurtarief
   - Resultaten worden direct gefilterd
