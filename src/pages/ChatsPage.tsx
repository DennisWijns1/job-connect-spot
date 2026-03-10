import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatListSkeleton } from '@/components/skeletons/ChatListSkeleton';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '@/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

const ChatsPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { conversations, isLoading } = useConversations();

  // Fallback to localStorage for backwards compatibility
  const userType = profile?.user_type || localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  const emptyStateText = isHandy
    ? 'Begin met swipen op projecten om contact te leggen met klanten'
    : "Begin met swipen om contact te leggen met Handy's";

  const headerSubtitle = isHandy ? 'Gesprekken met klanten' : "Gesprekken met Handy's";

  // Map conversations to display format, showing the other participant's name
  const chats = conversations.map((conv) => {
    const isParticipant1 = conv.participant_1 === user?.id;
    const otherProfile = isParticipant1 ? conv.p2 : conv.p1;

    return {
      id: conv.id,
      participant: {
        name: otherProfile?.full_name || 'Onbekend',
        avatar:
          otherProfile?.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${isParticipant1 ? conv.participant_2 : conv.participant_1}`,
        isOnline: false,
      },
      lastMessage: conv.last_message || '',
      lastMessageTime: conv.last_message_at ? new Date(conv.last_message_at) : new Date(conv.created_at),
      unreadCount: 0,
    };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Chats" showNotifications />

      <div className="px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">{headerSubtitle}</p>

        {isLoading ? (
          <ChatListSkeleton />
        ) : chats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Nog geen gesprekken
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {emptyStateText}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat, index) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full bg-card rounded-2xl p-4 shadow-soft hover:shadow-card transition-all text-left border border-border"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={chat.participant.avatar}
                      alt={chat.participant.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    {chat.participant.isOnline && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {chat.participant.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(chat.lastMessageTime, { addSuffix: false, locale: nl })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {chat.unreadCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChatsPage;
