
# Plan: Profiel & Instellingen Uitbreiding voor Seekers

## Samenvatting
Dit plan bevat uitgebreide aanpassingen voor het "Zoeker" gebruikerstype:
1. **Project plaatsen** - Knop functioneel maken + budget/uurtarief slider toevoegen
2. **Favorieten synchronisatie** - Centrale data store voor consistente weergave
3. **Locatie weergave** - Adres tonen met wijzigingsmogelijkheid
4. **Uitgebreide Instellingen pagina** - Volledig nieuwe pagina met alle gevraagde secties

---

## Deel 1: Project Plaatsen Button Fix + Budget Slider

### Probleem
De "Project plaatsen" knop op de profielpagina toont alleen een toast "Deze functie komt binnenkort!" in plaats van de CreateProjectSheet te openen.

### Oplossing

**Bestand: `src/pages/ProfilePage.tsx`**
- Import `CreateProjectSheet` component
- Voeg state toe: `const [showCreateProject, setShowCreateProject] = useState(false)`
- Wijzig onClick voor "Project plaatsen" om sheet te openen
- Render `<CreateProjectSheet>` in de return

**Bestand: `src/components/CreateProjectSheet.tsx`**
Toevoegen van budget/uurtarief sectie:

```text
+--------------------------------------------------+
| NIEUW: Betaalmethode keuze                       |
+--------------------------------------------------+
| ○ Vast budget    ○ Uurtarief                     |
|                                                  |
| Schuifbalk: €0 ─────●───────── €500              |
|             (of €0/uur - €100/uur)               |
+--------------------------------------------------+
```

Nieuwe state variabelen:
- `budgetType: 'fixed' | 'hourly'`
- `maxBudget: number` (0-500 voor vast budget)
- `maxHourlyRate: number` (0-100 voor uurtarief)

UI Elementen:
- Radio buttons voor keuze vast/uurtarief
- Slider component uit `@/components/ui/slider`
- Dynamisch label dat bedrag toont

---

## Deel 2: Favorieten Synchronisatie

### Probleem
De favorieten in SwipeHeader (ster icoon) en ProfilePage ("Favorieten" menu-item) gebruiken aparte mock data bronnen.

### Oplossing

**Nieuw bestand: `src/stores/favoritesStore.ts`**

Centrale store voor favorieten met localStorage persistentie:

```typescript
// Functies die worden geexporteerd:
getFavorites(): FavoriteHandy[]
addFavorite(handy: FavoriteHandy): void
removeFavorite(handyId: string): void
isFavorite(handyId: string): boolean
```

**Aanpassingen:**
- `SwipeHeader.tsx` - Gebruik centrale store
- `Header.tsx` - Gebruik centrale store
- `ProfilePage.tsx` - "Favorieten" opent nu FavoritesSheet

**Nieuw bestand: `src/components/FavoritesSheet.tsx`**

Bottom sheet met volledige favorieten lijst:
- Dezelfde data als in SwipeHeader dropdown
- Optie om favorieten te verwijderen
- Navigatie naar handy profiel

---

## Deel 3: Locatie Weergave

### Huidige situatie
"Locatie" menu-item toont alleen "Bewerk je adres" met toast.

### Nieuwe situatie

**Bestand: `src/pages/ProfilePage.tsx`**

Wijzig het "Locatie" menu-item om het huidige adres te tonen:

```text
┌──────────────────────────────────────────┐
│ 📍  Locatie                              │
│     Martensstraat 39, 3271 Averbode    → │
└──────────────────────────────────────────┘
```

**Nieuw bestand: `src/components/LocationEditSheet.tsx`**

Bottom sheet voor adres wijzigen:
- Input velden: Straat + nummer, Postcode, Gemeente
- Opslaan naar localStorage
- Pre-filled met "Martensstraat 39, 3271 Averbode"

---

## Deel 4: Uitgebreide Instellingen Pagina

**Nieuw bestand: `src/pages/SettingsPage.tsx`**

Volledige instellingenpagina met 5 hoofdsecties.

### Sectie 1: Account Beheer

| Item | Beschrijving | Icoon |
|------|--------------|-------|
| Persoonlijke Informatie | Naam, e-mail, telefoonnummer | User |
| Wachtwoord & Beveiliging | Wijzig wachtwoord, 2FA instellen | Lock |
| Verificatiestatus | Badge: Geverifieerd / Niet geverifieerd | ShieldCheck |

### Sectie 2: Privacy & Zichtbaarheid

| Item | Type | Icoon |
|------|------|-------|
| Profiel zichtbaarheid | Switch (Openbaar / Enkel matches) | Eye |
| Locatievoorkeuren | Switch (Exact adres / Enkel regio) | MapPin |
| Online status | Switch (Toon "Laatst actief") | Activity |
| Geblokkeerde gebruikers | Lijst weergave | Ban |

### Sectie 3: Reputatie & Historiek

| Item | Type | Icoon |
|------|------|-------|
| Ratings zichtbaar | Switch | Star |
| Voltooide klussen tonen | Switch | CheckCircle2 |

### Sectie 4: Interactie & Meldingen

| Item | Type | Icoon |
|------|------|-------|
| Nieuwe matches | Switch (Push notificatie) | Heart |
| Ontvangen berichten | Switch (Push notificatie) | MessageCircle |
| App updates | Switch (Push notificatie) | Bell |
| Contactvoorkeuren | Dropdown (Iedereen / Enkel geverifieerd) | Filter |

### Sectie 5: Juridisch & Data

| Item | Beschrijving | Icoon |
|------|--------------|-------|
| Download mijn data | GDPR compliance | Download |
| Algemene Voorwaarden | Link | FileText |
| Privacybeleid | Link | FileText |
| Uitloggen | Knop | LogOut |
| Account verwijderen | Rode knop | Trash2 |

---

## Design Specificaties

### Visueel ontwerp
- **Kleurenpalet**: Petrol headers, zachte abrikoos accents
- **Scheidingslijnen**: Subtiele `border-border` tussen items
- **Navigatie-indicator**: Elk item eindigt met `ChevronRight`
- **Secties**: Gescheiden door witruimte en sectie headers

### Component structuur

```text
SettingsPage
├── Header (Petrol gradient)
├── ScrollArea
│   ├── Section: Account Beheer
│   │   ├── SettingsItem (→ PersonalInfoSheet)
│   │   ├── SettingsItem (→ SecuritySheet)
│   │   └── SettingsItem (verificatie badge inline)
│   ├── Separator
│   ├── Section: Privacy & Zichtbaarheid
│   │   ├── SettingsToggle
│   │   ├── SettingsToggle
│   │   ├── SettingsToggle
│   │   └── SettingsItem (→ BlockedUsersSheet)
│   ├── Separator
│   ├── Section: Reputatie & Historiek
│   │   ├── SettingsToggle
│   │   └── SettingsToggle
│   ├── Separator
│   ├── Section: Interactie & Meldingen
│   │   ├── SettingsToggle
│   │   ├── SettingsToggle
│   │   ├── SettingsToggle
│   │   └── SettingsItem (→ ContactPreferencesSheet)
│   ├── Separator
│   └── Section: Juridisch & Data
│       ├── SettingsItem (download)
│       ├── SettingsItem (link)
│       ├── SettingsItem (link)
│       ├── Button (uitloggen)
│       └── Button (verwijderen - destructive)
└── BottomNav
```

---

## Nieuwe Bestanden

| Bestand | Beschrijving |
|---------|--------------|
| `src/pages/SettingsPage.tsx` | Hoofdinstellingenpagina |
| `src/components/FavoritesSheet.tsx` | Favorieten bottom sheet |
| `src/components/LocationEditSheet.tsx` | Locatie bewerken sheet |
| `src/components/settings/PersonalInfoSheet.tsx` | Persoonlijke info bewerken |
| `src/components/settings/SecuritySheet.tsx` | Wachtwoord & 2FA |
| `src/components/settings/BlockedUsersSheet.tsx` | Geblokkeerde gebruikers |
| `src/stores/favoritesStore.ts` | Centrale favorieten store |

---

## Routing Aanpassingen

**Bestand: `src/App.tsx`**

Nieuwe route toevoegen:
```typescript
<Route path="/settings" element={<SettingsPage />} />
```

**Bestand: `src/pages/ProfilePage.tsx`**

Instellingen knop navigeert nu naar `/settings`:
```typescript
onClick={() => navigate('/settings')}
```

---

## Technische Details

### Budget Slider in CreateProjectSheet

```typescript
// Nieuwe state
const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>('fixed');
const [maxBudget, setMaxBudget] = useState([250]); // Array voor Slider

// JSX
<Label>Maximaal budget</Label>
<div className="flex gap-2 mb-4">
  <button 
    onClick={() => setBudgetType('fixed')}
    className={`flex-1 py-2 px-3 rounded-xl ${
      budgetType === 'fixed' 
        ? 'bg-primary text-white' 
        : 'bg-muted text-muted-foreground'
    }`}
  >
    Vast budget
  </button>
  <button 
    onClick={() => setBudgetType('hourly')}
    className={...}
  >
    Uurtarief
  </button>
</div>

<div className="space-y-3">
  <Slider
    value={maxBudget}
    onValueChange={setMaxBudget}
    max={budgetType === 'fixed' ? 500 : 100}
    step={budgetType === 'fixed' ? 25 : 5}
    className="w-full"
  />
  <div className="flex justify-between text-sm text-muted-foreground">
    <span>€0{budgetType === 'hourly' ? '/uur' : ''}</span>
    <span className="font-semibold text-foreground">
      €{maxBudget[0]}{budgetType === 'hourly' ? '/uur' : ''}
    </span>
    <span>€{budgetType === 'fixed' ? '500' : '100'}/uur</span>
  </div>
</div>
```

### Favorieten Store

```typescript
// src/stores/favoritesStore.ts
const STORAGE_KEY = 'handymatch_favorites';

export interface FavoriteHandy {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
}

// Initieel met mock data voor demonstratie
const initialFavorites: FavoriteHandy[] = [
  { id: '1', name: 'Jan Peeters', ... },
  // ... rest van mock data
];

export const getFavorites = (): FavoriteHandy[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialFavorites;
};

export const addFavorite = (handy: FavoriteHandy) => {
  const current = getFavorites();
  if (!current.find(f => f.id === handy.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, handy]));
  }
};

export const removeFavorite = (handyId: string) => {
  const current = getFavorites();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(
    current.filter(f => f.id !== handyId)
  ));
};
```

### Settings Toggle Component

Herbruikbaar component voor switch-gebaseerde instellingen:

```typescript
interface SettingsToggleProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SettingsToggle = ({ icon: Icon, label, description, checked, onCheckedChange }: SettingsToggleProps) => (
  <div className="flex items-center gap-4 p-4 border-b border-border">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-foreground">{label}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);
```

---

## Samenvatting Wijzigingen

| Bestand | Type | Actie |
|---------|------|-------|
| `src/pages/ProfilePage.tsx` | Bestaand | Wijzigen |
| `src/components/CreateProjectSheet.tsx` | Bestaand | Uitbreiden met budget slider |
| `src/components/SwipeHeader.tsx` | Bestaand | Favorieten store integratie |
| `src/components/Header.tsx` | Bestaand | Favorieten store integratie |
| `src/App.tsx` | Bestaand | Route toevoegen |
| `src/pages/SettingsPage.tsx` | Nieuw | Volledige pagina |
| `src/stores/favoritesStore.ts` | Nieuw | Centrale store |
| `src/components/FavoritesSheet.tsx` | Nieuw | Bottom sheet |
| `src/components/LocationEditSheet.tsx` | Nieuw | Bottom sheet |
| `src/components/settings/*.tsx` | Nieuw | 3 sub-sheets |
