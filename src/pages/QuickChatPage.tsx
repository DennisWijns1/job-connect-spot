import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProblemInputDialog } from '@/components/ProblemInputDialog';
import { Send, MessageCircle, Video, Clock, User, Phone, Mic, MicOff, VideoOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockHandyProfiles } from '@/data/mockData';
import { toast } from 'sonner';

const MAX_CALL_DURATION = 300; // 5 minutes in seconds

const allAvailableHandys = mockHandyProfiles.filter(h => h.isOnline).slice(0, 4);

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

const QuickChatPage = () => {
  const [selectedHandy, setSelectedHandy] = useState<typeof allAvailableHandys[0] | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(MAX_CALL_DURATION);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredHandys, setFilteredHandys] = useState(allAvailableHandys);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Countdown timer for video call
  useEffect(() => {
    if (!isInCall) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endCall();
          toast.warning('Quick Chat videogesprek beëindigd', {
            description: 'Je kunt verder chatten of een nieuw videogesprek starten',
          });
          return MAX_CALL_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isInCall]);

  const startChat = (handy: typeof allAvailableHandys[0]) => {
    setSelectedHandy(handy);
    setChatMessages([
      {
        id: '1',
        senderId: handy.id,
        content: `Hallo! Ik ben ${handy.name}, ${handy.specialty.toLowerCase()}. Hoe kan ik je helpen?`,
        timestamp: new Date(),
        isUser: false,
      },
    ]);
  };

  const handleFilterApply = (filters: { problem: string; distance: number; minRating: number; maxPrice: number }) => {
    let filtered = allAvailableHandys;
    
    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(h => h.rating >= filters.minRating);
    }
    
    // Filter by price (hourly rate)
    if (filters.maxPrice < 100) {
      filtered = filtered.filter(h => (h.hourlyRate || 0) <= filters.maxPrice);
    }
    
    // Filter by problem/specialty (simple text match)
    if (filters.problem.trim()) {
      const searchLower = filters.problem.toLowerCase();
      filtered = filtered.filter(h => 
        h.specialty.toLowerCase().includes(searchLower) ||
        h.name.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredHandys(filtered);
    setShowFilterModal(false);
    
    if (filtered.length === 0) {
      toast.info('Geen handys gevonden met deze filters');
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedHandy) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      content: messageInput,
      timestamp: new Date(),
      isUser: true,
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    // Simulate handy response
    setTimeout(() => {
      const responses = [
        'Ik snap het probleem! Dat kan ik zeker helpen oplossen.',
        'Kun je misschien een foto sturen van het probleem?',
        'Dat klinkt als iets wat we snel kunnen oplossen. Wil je een videogesprek starten zodat ik het kan zien?',
        'Ik heb dit vaker gezien. Laat me je wat tips geven.',
      ];
      
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: selectedHandy.id,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        isUser: false,
      };
      
      setChatMessages(prev => [...prev, response]);
    }, 1500);
  };

  const startVideoCall = () => {
    if (!selectedHandy) return;
    
    setIsConnecting(true);
    
    setTimeout(() => {
      setIsConnecting(false);
      setIsInCall(true);
      setTimeRemaining(MAX_CALL_DURATION);
      toast.success(`Videogesprek gestart met ${selectedHandy.name}!`, {
        description: 'Je hebt 5 minuten voor dit gesprek',
      });
    }, 2000);
  };

  const endCall = () => {
    setIsInCall(false);
    setTimeRemaining(MAX_CALL_DURATION);
    setIsMuted(false);
    setIsVideoOff(false);
    toast.info('Videogesprek beëindigd');
  };

  const closeChat = () => {
    setSelectedHandy(null);
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        title="Quick Chat" 
        showBack 
        showSearch 
        onOpenSearch={() => setShowFilterModal(true)} 
      />

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {!selectedHandy && !isInCall && !isConnecting ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Intro */}
              <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-background rounded-2xl p-6 mb-6 border border-accent/20">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-xl text-foreground mb-1">
                      Snelle Chat & Video
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Start een chat met een beschikbare Handy. Als het probleem complexer is, kun je vanuit de chat een videogesprek starten voor live begeleiding.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-accent/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4 text-accent" />
                    <span>Chat eerst</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="w-4 h-4 text-accent" />
                    <span>Video indien nodig</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>Max 5 min video</span>
                  </div>
                </div>
              </div>

              {/* Available Handys */}
              <h3 className="font-semibold text-foreground mb-4">
                Beschikbare Handy's
              </h3>

              <div className="space-y-3">
                {filteredHandys.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Geen handys gevonden</p>
                    <Button
                      variant="link"
                      onClick={() => setFilteredHandys(allAvailableHandys)}
                      className="text-accent"
                    >
                      Filters wissen
                    </Button>
                  </div>
                ) : (
                  filteredHandys.map((handy, index) => (
                    <motion.div
                      key={handy.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-2xl p-4 border border-border hover:border-accent/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={handy.avatar}
                            alt={handy.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">{handy.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">{handy.specialty}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-medium">{handy.rating}</span>
                            <span className="text-sm">🔨</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => startChat(handy)}
                          className="bg-gradient-to-r from-accent to-accent/80 hover:brightness-110 text-accent-foreground rounded-xl px-4"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : isConnecting ? (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative mb-6">
                <img
                  src={selectedHandy?.avatar}
                  alt={selectedHandy?.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-accent"
                />
                <div className="absolute inset-0 rounded-full border-4 border-accent/30 animate-ping" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Verbinden met {selectedHandy?.name}...
              </h3>
              <p className="text-muted-foreground">Even geduld</p>
            </motion.div>
          ) : isInCall ? (
            <motion.div
              key="in-call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground z-40"
            >
              {/* Video feed placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-foreground">
                <img
                  src={selectedHandy?.avatar}
                  alt={selectedHandy?.name}
                  className="w-full h-full object-cover opacity-30"
                />
              </div>

              {/* Self video (small) */}
              <div className="absolute top-20 right-4 w-28 h-40 bg-card rounded-2xl overflow-hidden border-2 border-card shadow-lg">
                {isVideoOff ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Timer */}
              <div className="absolute top-20 left-4 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>

              {/* Partner info */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
                <h3 className="text-2xl font-bold text-primary-foreground mb-1">{selectedHandy?.name}</h3>
                <p className="text-primary-foreground/70">{selectedHandy?.specialty}</p>
              </div>

              {/* Call controls */}
              <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-4 px-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isMuted ? 'bg-destructive' : 'bg-card/80'
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-destructive-foreground" />
                  ) : (
                    <Mic className="w-6 h-6 text-foreground" />
                  )}
                </button>

                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/90 transition-colors"
                >
                  <Phone className="w-7 h-7 text-destructive-foreground rotate-[135deg]" />
                </button>

                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-destructive' : 'bg-card/80'
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-6 h-6 text-destructive-foreground" />
                  ) : (
                    <Video className="w-6 h-6 text-foreground" />
                  )}
                </button>
              </div>
            </motion.div>
          ) : selectedHandy ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[calc(100vh-200px)]"
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                <button onClick={closeChat} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="relative">
                  <img
                    src={selectedHandy.avatar}
                    alt={selectedHandy.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{selectedHandy.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedHandy.specialty}</p>
                </div>
                <Button
                  onClick={startVideoCall}
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                >
                  <Video className="w-4 h-4 mr-1" />
                  Video
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.isUser
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-3">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Typ je bericht..."
                  className="flex-1 h-12 rounded-xl bg-card border-border"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {!isInCall && !isConnecting && <BottomNav />}

      {/* Filter Modal */}
      <ProblemInputDialog
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onSubmit={handleFilterApply}
      />
    </div>
  );
};

export default QuickChatPage;
