// Local storage-based AI conversation persistence

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
  aiResponse?: any;
  photoUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'handymatch_ai_conversations';
const ACTIVE_KEY = 'handymatch_ai_active_conversation';

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('localStorage quota exceeded, clearing old data...');
    // Try to free space by removing oldest conversations
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const convos: Conversation[] = JSON.parse(raw);
        // Keep only the 5 most recent, strip photoUrls
        const trimmed = convos.slice(0, 5).map(c => ({
          ...c,
          messages: c.messages.map(m => ({ ...m, photoUrl: undefined })),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        // Retry original save
        localStorage.setItem(key, value);
        return true;
      }
    } catch {
      // Last resort: clear conversation storage entirely
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function getConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActiveConversationId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveConversationId(id: string | null) {
  if (id) {
    safeSetItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function saveConversation(conversation: Conversation) {
  // Strip large photoUrl data before storing to prevent quota issues
  const cleaned: Conversation = {
    ...conversation,
    messages: conversation.messages.map(m => ({
      ...m,
      // Only keep short URLs, strip base64 data URLs
      photoUrl: m.photoUrl && m.photoUrl.length > 500 ? undefined : m.photoUrl,
    })),
  };
  
  const conversations = getConversations();
  const idx = conversations.findIndex(c => c.id === cleaned.id);
  if (idx >= 0) {
    conversations[idx] = cleaned;
  } else {
    conversations.unshift(cleaned);
  }
  // Keep max 10 conversations to save space
  const trimmed = conversations.slice(0, 10);
  safeSetItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function deleteConversation(id: string) {
  const conversations = getConversations().filter(c => c.id !== id);
  safeSetItem(STORAGE_KEY, JSON.stringify(conversations));
  if (getActiveConversationId() === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function generateConversationTitle(messages: StoredMessage[]): string {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    return firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
  }
  return 'Nieuw gesprek';
}
