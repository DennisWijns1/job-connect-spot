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

// Initial mock data for demonstration
const initialFavorites: FavoriteHandy[] = [
  { 
    id: '1', 
    name: 'Jan Peeters', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', 
    specialty: 'Loodgieter', 
    rating: 4.8,
    reviewCount: 127,
    location: 'Leuven'
  },
  { 
    id: '2', 
    name: 'Mieke Janssen', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', 
    specialty: 'Elektricien', 
    rating: 4.9,
    reviewCount: 89,
    location: 'Brussel'
  },
  { 
    id: '3', 
    name: 'Peter Van den Berg', 
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg', 
    specialty: 'Dakdekker', 
    rating: 4.7,
    reviewCount: 56,
    location: 'Antwerpen'
  },
  { 
    id: '4', 
    name: 'Lisa De Smet', 
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg', 
    specialty: 'Schilder', 
    rating: 4.6,
    reviewCount: 34,
    location: 'Gent'
  },
];

// Initialize storage with mock data if empty
const initializeStorage = (): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFavorites));
  }
};

export const getFavorites = (): FavoriteHandy[] => {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addFavorite = (handy: FavoriteHandy): void => {
  const current = getFavorites();
  if (!current.find(f => f.id === handy.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, handy]));
  }
};

export const removeFavorite = (handyId: string): void => {
  const current = getFavorites();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(
    current.filter(f => f.id !== handyId)
  ));
};

export const isFavorite = (handyId: string): boolean => {
  const current = getFavorites();
  return current.some(f => f.id === handyId);
};
