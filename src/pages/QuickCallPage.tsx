import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Video, Phone, Clock, User, X, Mic, MicOff, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockHandyProfiles } from '@/data/mockData';
import { toast } from 'sonner';

const MAX_CALL_DURATION = 300; // 5 minutes in seconds

const availableHandys = mockHandyProfiles.filter(h => h.isOnline).slice(0, 4);

const QuickCallPage = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [callPartner, setCallPartner] = useState<typeof availableHandys[0] | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(MAX_CALL_DURATION);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = useCallback((handy: typeof availableHandys[0]) => {
    setIsConnecting(true);
    setCallPartner(handy);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsInCall(true);
      setTimeRemaining(MAX_CALL_DURATION);
      toast.success(`Verbonden met ${handy.name}!`, {
        description: 'Je hebt 5 minuten voor deze Quick Call',
      });
    }, 2000);
  }, []);

  const endCall = useCallback(() => {
    setIsInCall(false);
    setCallPartner(null);
    setTimeRemaining(MAX_CALL_DURATION);
    setIsMuted(false);
    setIsVideoOff(false);
    toast.info('Gesprek beëindigd');
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isInCall) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endCall();
          toast.warning('Quick Call tijd verstreken', {
            description: 'Start een nieuwe call als je meer hulp nodig hebt',
          });
          return MAX_CALL_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isInCall, endCall]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Quick Call" showBack />

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {!isInCall && !isConnecting ? (
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
                    <Video className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-xl text-foreground mb-1">
                      Snelle Video Hulp
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Start een 5-minuten videogesprek met een handyman in de buurt. Perfect voor snelle vragen of live begeleiding bij een klus.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-accent/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>Max 5 minuten</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="w-4 h-4 text-accent" />
                    <span>FaceTime stijl</span>
                  </div>
                </div>
              </div>

              {/* Available Handys */}
              <h3 className="font-semibold text-foreground mb-4">
                Beschikbare Handy's voor Quick Call
              </h3>

              <div className="space-y-3">
                {availableHandys.map((handy, index) => (
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
                        onClick={() => startCall(handy)}
                        className="bg-gradient-to-r from-accent to-accent/80 hover:brightness-110 text-accent-foreground rounded-xl px-4"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Bel
                      </Button>
                    </div>
                  </motion.div>
                ))}
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
                  src={callPartner?.avatar}
                  alt={callPartner?.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-accent"
                />
                <div className="absolute inset-0 rounded-full border-4 border-accent/30 animate-ping" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Verbinden met {callPartner?.name}...
              </h3>
              <p className="text-muted-foreground">Even geduld</p>
            </motion.div>
          ) : (
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
                  src={callPartner?.avatar}
                  alt={callPartner?.name}
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
                <h3 className="text-2xl font-bold text-primary-foreground mb-1">{callPartner?.name}</h3>
                <p className="text-primary-foreground/70">{callPartner?.specialty}</p>
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
          )}
        </AnimatePresence>
      </div>

      {!isInCall && !isConnecting && <BottomNav />}
    </div>
  );
};

export default QuickCallPage;