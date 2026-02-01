
# Plan: Tab Volgorde Wijziging (Alleen Seekers)

## Samenvatting
Swap AI Hulp en Swipe tabs **alleen voor Seekers**. Handy's behouden hun huidige volgorde.

---

## Wijziging

### Huidige volgorde (Seekers)
```text
1. Swipe (Home)     ← Positie 1
2. Kaart
3. Quick Chat
4. AI Hulp          ← Positie 4
5. Chats
6. Profiel
```

### Nieuwe volgorde (Seekers)
```text
1. AI Hulp          ← Nieuw op positie 1
2. Kaart
3. Quick Chat
4. Swipe            ← Verplaatst naar positie 4
5. Chats
6. Profiel
```

### Handy's (ongewijzigd)
```text
1. Swipe
2. Kaart
3. Lessen
4. AI Hulp
5. Chats
6. Profiel
```

---

## Technische Details

### Bestand
`src/components/BottomNav.tsx` - regels 11-17

### Code wijziging
```typescript
// VOOR (Seekers array)
const navItems = isSeeker ? [
  { icon: Home, label: 'Swipe', path: '/swipe' },
  { icon: Map, label: 'Kaart', path: '/map' },
  { icon: MessagesSquare, label: 'Quick Chat', path: '/quick-chat', highlight: true },
  { icon: Bot, label: 'AI Hulp', path: '/ai' },
  { icon: MessageCircle, label: 'Chats', path: '/chats' },
  { icon: User, label: 'Profiel', path: '/profile' },
]

// NA (Seekers array)
const navItems = isSeeker ? [
  { icon: Bot, label: 'AI Hulp', path: '/ai' },
  { icon: Map, label: 'Kaart', path: '/map' },
  { icon: MessagesSquare, label: 'Quick Chat', path: '/quick-chat', highlight: true },
  { icon: Home, label: 'Swipe', path: '/swipe' },
  { icon: MessageCircle, label: 'Chats', path: '/chats' },
  { icon: User, label: 'Profiel', path: '/profile' },
]
```

---

## Visueel Resultaat

### Seekers (nieuw)
```
┌─────────────────────────────────────────────────┐
│  🤖       🗺️      💬       🏠       💬     👤  │
│  AI     Kaart   Quick    Swipe   Chats  Profiel│
│  Hulp           Chat                           │
└─────────────────────────────────────────────────┘
```

### Handy's (ongewijzigd)
```
┌─────────────────────────────────────────────────┐
│  🏠       🗺️      🎓       🤖       💬     👤  │
│ Swipe   Kaart  Lessen    AI     Chats  Profiel │
│                         Hulp                    │
└─────────────────────────────────────────────────┘
```
