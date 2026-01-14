export type UserType = 'handy' | 'seeker' | null;

export interface HandyProfile {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  specialties: string[];
  description: string;
  hourlyRate: number | null;
  isQuoteBased: boolean;
  isProfessional: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  distance: number;
  location: string;
  isOnline: boolean;
  workPhotos: string[];
  experience: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  photos: string[];
  location: string;
  postedBy: string;
  postedAt: Date;
  category: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAppointmentRequest?: boolean;
}

export interface Chat {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface FilterOptions {
  minRating: number;
  maxDistance: number;
  maxHourlyRate: number;
  professionalOnly: boolean;
  categories: string[];
}
