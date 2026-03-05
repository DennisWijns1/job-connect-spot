import { Chat } from '@/types/handymatch';

// Chats from the perspective of a Handy (talking to seekers/clients)
export const mockHandyChats: Chat[] = [
  {
    id: 'h1',
    participant: {
      id: 'seeker1',
      name: 'Sophie Maes',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      isOnline: true,
    },
    lastMessage: 'Super, dan verwacht ik je morgen om 14u!',
    lastMessageTime: new Date(Date.now() - 10 * 60 * 1000),
    unreadCount: 1,
    messages: [
      {
        id: '1',
        senderId: 'seeker1',
        text: 'Hallo! Ik heb een probleem met mijn stopcontact in de keuken. Het geeft geen stroom meer.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: '2',
        senderId: 'user',
        text: 'Hallo Sophie! Dat klinkt als een los contact of een defecte aansluiting. Ik kan dat zeker oplossen voor je.',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      },
      {
        id: '3',
        senderId: 'seeker1',
        text: 'Fijn! Wanneer zou je kunnen langskomen?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '4',
        senderId: 'user',
        text: 'Ik kan morgen om 14u langskomen, past dat?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        isAppointmentRequest: true,
      },
      {
        id: '5',
        senderId: 'seeker1',
        text: 'Super, dan verwacht ik je morgen om 14u!',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  },
  {
    id: 'h2',
    participant: {
      id: 'seeker2',
      name: 'Marc Willems',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      isOnline: false,
    },
    lastMessage: 'Kan je een offerte sturen voor de zekeringskast?',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    unreadCount: 3,
    messages: [
      {
        id: '1',
        senderId: 'seeker2',
        text: 'Hoi, ik heb je profiel gezien op HandyMatch. Onze zekeringskast moet nagekeken worden.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        id: '2',
        senderId: 'user',
        text: 'Hallo Marc! Dat doe ik graag. Hoe oud is je zekeringskast?',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
      },
      {
        id: '3',
        senderId: 'seeker2',
        text: 'Ongeveer 20 jaar oud. Er springen soms zekeringen.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: '4',
        senderId: 'seeker2',
        text: 'Kan je een offerte sturen voor de zekeringskast?',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: 'h3',
    participant: {
      id: 'seeker3',
      name: 'Anna De Vries',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
      isOnline: true,
    },
    lastMessage: 'Bedankt voor de snelle reparatie! ⭐⭐⭐⭐⭐',
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    unreadCount: 0,
    messages: [
      {
        id: '1',
        senderId: 'seeker3',
        text: 'Bedankt voor de snelle reparatie! ⭐⭐⭐⭐⭐',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  },
];
