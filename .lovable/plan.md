

# Plan: Direct Chat Openen vanuit Kaart

## Probleem
Wanneer je op de kaart op "Start Chat" klikt bij een handy, navigeert de app naar `/chats` maar opent niet direct een gesprek. Je komt op de chatlijst terecht in plaats van in een actief chatscherm.

---

## Oplossing

Navigeer direct naar een dynamische chat detail pagina (`/chat/:handyId`) en zorg dat `ChatDetailPage` een nieuw gesprek kan starten als er nog geen chat bestaat met die handy.

---

## Wijzigingen

### 1. MapPage.tsx - Directe navigatie naar chat

**Huidige code (regel 56-58):**
```typescript
const handleStartChat = (id: string, name: string) => {
  navigate('/chats', { state: { newChatWith: id, handyName: name } });
};
```

**Nieuwe code:**
```typescript
const handleStartChat = (id: string, name: string, avatar: string) => {
  navigate(`/chat/new-${id}`, { 
    state: { 
      isNewChat: true,
      handyId: id, 
      handyName: name,
      handyAvatar: avatar
    } 
  });
};
```

De button onClick moet ook de avatar meegeven:
```typescript
onClick={(e) => {
  e.stopPropagation();
  handleStartChat(handy.id, handy.name, handy.avatar);
}}
```

---

### 2. ChatDetailPage.tsx - Ondersteuning voor nieuwe chats

Uitbreiden van de component om nieuwe gesprekken te ondersteunen:

**Nieuwe imports:**
```typescript
import { useParams, useLocation } from 'react-router-dom';
```

**Nieuwe logica:**
```typescript
const { id } = useParams();
const location = useLocation();
const state = location.state as {
  isNewChat?: boolean;
  handyId?: string;
  handyName?: string;
  handyAvatar?: string;
} | null;

// Check of dit een nieuwe chat is
const isNewChat = state?.isNewChat && id?.startsWith('new-');

// Bestaande chat zoeken of nieuwe aanmaken
const existingChat = mockChats.find(c => c.id === id);

// Participant data (uit state voor nieuwe chat, uit bestaande chat anders)
const participant = isNewChat 
  ? {
      id: state.handyId!,
      name: state.handyName!,
      avatar: state.handyAvatar!,
      isOnline: true
    }
  : existingChat?.participant;

// Messages: leeg voor nieuwe chat, bestaand voor oude
const [messages, setMessages] = useState(
  isNewChat ? [] : (existingChat?.messages || [])
);
```

**UI aanpassing voor lege chat:**
Wanneer `messages.length === 0`, toon een welkomstbericht:

```text
┌────────────────────────────────────┐
│                                    │
│    ┌──────┐                        │
│    │ 👤   │                        │
│    └──────┘                        │
│                                    │
│    Start een gesprek met           │
│    {handyName}                     │
│                                    │
│    Beschrijf je klus of stel       │
│    een vraag!                      │
│                                    │
└────────────────────────────────────┘
```

---

## Visuele Flow

```text
KAART PAGINA                    CHAT DETAIL PAGINA
┌──────────────────┐           ┌──────────────────┐
│                  │           │ ← Jan De Smedt   │
│   📍 Jan         │           ├──────────────────┤
│   ┌────────────┐ │   KLIK    │                  │
│   │ Start Chat │ ├──────────►│  Start een       │
│   └────────────┘ │           │  gesprek met     │
│                  │           │  Jan De Smedt    │
│                  │           │                  │
└──────────────────┘           ├──────────────────┤
                               │ [Typ een bericht]│
                               └──────────────────┘
```

---

## Technische Details

### Bestanden te wijzigen

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/MapPage.tsx` | `handleStartChat` navigeert naar `/chat/new-{id}` met handy data in state |
| `src/pages/ChatDetailPage.tsx` | Ondersteun nieuwe chats via location state |

### ChatDetailPage aanpassingen

```typescript
// src/pages/ChatDetailPage.tsx

import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// ... andere imports

const ChatDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State uit navigatie voor nieuwe chat
  const navState = location.state as {
    isNewChat?: boolean;
    handyId?: string;
    handyName?: string;
    handyAvatar?: string;
  } | null;
  
  const isNewChat = navState?.isNewChat && id?.startsWith('new-');
  const existingChat = mockChats.find(c => c.id === id);
  
  // Fallback: als geen bestaande chat EN geen nieuwe chat state → terug
  if (!existingChat && !isNewChat) {
    // Component renderen met "niet gevonden" of redirect
  }
  
  // Participant bepalen
  const participant = isNewChat 
    ? {
        id: navState!.handyId!,
        name: navState!.handyName!,
        avatar: navState!.handyAvatar!,
        isOnline: true,
      }
    : existingChat!.participant;
  
  const [messages, setMessages] = useState(
    isNewChat ? [] : (existingChat?.messages || [])
  );
  
  // ... rest van component
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header met participant info */}
      
      {/* Messages - met lege state voor nieuwe chat */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <img 
              src={participant.avatar} 
              className="w-20 h-20 rounded-full mb-4"
            />
            <h3 className="font-semibold text-lg">
              Start een gesprek met {participant.name}
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              Beschrijf je klus of stel een vraag!
            </p>
          </div>
        ) : (
          // Bestaande messages rendering
        )}
      </div>
      
      {/* Input veld */}
    </div>
  );
};
```

---

## Resultaat

Na implementatie:
1. Gebruiker klikt op "Start Chat" bij een handy op de kaart
2. App navigeert direct naar `/chat/new-{handyId}`
3. Chatscherm opent met de handy's naam en avatar in de header
4. Leeg chatvenster met uitnodiging om een bericht te typen
5. Gebruiker kan direct beginnen met chatten

