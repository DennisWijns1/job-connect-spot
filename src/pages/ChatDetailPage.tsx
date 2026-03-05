import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockChats } from '@/data/mockData';
import { mockHandyChats } from '@/data/handyMockData';
import { Send, Calendar, Phone, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { AddToCalendarSheet, AppointmentData } from '@/components/AddToCalendarSheet';

const ChatDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  
  // State uit navigatie voor nieuwe chat
  const navState = location.state as {
    isNewChat?: boolean;
    handyId?: string;
    handyName?: string;
    handyAvatar?: string;
  } | null;
  
  const isNewChat = navState?.isNewChat && id?.startsWith('new-');
  const existingChat = mockChats.find(c => c.id === id);
  
  // Participant bepalen
  const participant = isNewChat 
    ? {
        id: navState!.handyId!,
        name: navState!.handyName!,
        avatar: navState!.handyAvatar!,
        isOnline: true,
      }
    : existingChat?.participant;
  
  const [messages, setMessages] = useState(
    isNewChat ? [] : (existingChat?.messages || [])
  );
  const [input, setInput] = useState('');
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  const handleAppointment = () => {
    setShowCalendarSheet(true);
  };

  const handleConfirmAppointment = (appointment: AppointmentData) => {
    // Hier kun je de afspraak opslaan in de database
    console.log('Afspraak bevestigd:', appointment);
  };

  if (!participant) {
    return <div>Chat niet gevonden</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Custom Header */}
      <header className="sticky top-0 glass border-b border-border safe-area-top z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              ←
            </button>
            <div className="relative">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
              {participant.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
              )}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {participant.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {participant.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img 
              src={participant.avatar} 
              alt={participant.name}
              className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-card shadow-lg"
            />
            <h3 className="font-semibold text-lg text-foreground">
              Start een gesprek met {participant.name}
            </h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-[250px]">
              Beschrijf je klus of stel een vraag!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex mb-4 ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    message.senderId === 'user'
                      ? 'rounded-br-sm text-white' : 'bg-card shadow-soft rounded-bl-sm border border-border'
                  }`}
                  style={message.senderId === 'user' ? { backgroundColor: 'hsl(330, 65%, 55%)' } : {}}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === 'user' ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: nl })}
                  </p>

                  {message.isAppointmentRequest && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <button
                        onClick={handleAppointment}
                        className="w-full py-2 px-4 rounded-xl bg-primary/20 text-primary font-medium text-sm flex items-center justify-center gap-2 border border-primary/30"
                      >
                        <Calendar className="w-4 h-4" />
                        Afspraak bevestigen
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <button
          onClick={handleAppointment}
          className="w-full py-3 rounded-xl bg-accent/10 text-accent font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Afspraak voorstellen
        </button>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 left-0 right-0 px-4 py-4 glass safe-area-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Typ een bericht..."
              className="h-12 rounded-xl pr-12 bg-card border-border"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add to Calendar Sheet */}
      <AddToCalendarSheet
        isOpen={showCalendarSheet}
        onClose={() => setShowCalendarSheet(false)}
        participantName={participant?.name || 'Onbekend'}
        onConfirm={handleConfirmAppointment}
      />
    </div>
  );
};

export default ChatDetailPage;
