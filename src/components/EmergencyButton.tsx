import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Phone, X, MessageCircle, PhoneCall, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NearbyUser {
  id: string;
  name: string;
  distance: number;
}

export const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [showSlideToCall, setShowSlideToCall] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mock nearby users for demo
  const mockNearbyUsers: NearbyUser[] = [
    { id: '1', name: 'Jan P.', distance: 2.3 },
    { id: '2', name: 'Marie V.', distance: 4.7 },
    { id: '3', name: 'Tom D.', distance: 8.1 },
    { id: '4', name: 'Lisa M.', distance: 12.5 },
  ];

  // Get user location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Averbode for demo
          setUserLocation({ lat: 51.0283, lng: 5.0308 });
        }
      );
    }
  }, []);

  // Start emergency broadcast
  const startEmergency = () => {
    getUserLocation();
    setIsEmergencyActive(true);
    setShowSlideToCall(true);
    setTimeRemaining(15 * 60);
    // Simulate finding nearby users
    setNearbyUsers(mockNearbyUsers.filter(u => u.distance <= 15));
  };

  // Cancel emergency
  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    setShowSlideToCall(false);
    setSlideProgress(0);
    setTimeRemaining(15 * 60);
    setNearbyUsers([]);
    setIsOpen(false);
  };

  // Handle slide to call
  const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSlideProgress(value);
    
    if (value >= 95) {
      // Trigger 112 call
      window.location.href = 'tel:112';
    }
  };

  // Countdown timer
  useEffect(() => {
    if (isEmergencyActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      cancelEmergency();
    }
  }, [isEmergencyActive, timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If emergency is active, show full-screen emergency overlay
  if (isEmergencyActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-destructive flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="text-white font-bold">NOODSIGNAAL ACTIEF</span>
          </div>
          <div className="text-white font-mono text-lg">
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Location Info */}
        <div className="p-4 bg-black/10">
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">
              {userLocation 
                ? `Locatie: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                : 'Locatie wordt bepaald...'
              }
            </span>
          </div>
          <p className="text-white/70 text-xs mt-1">
            Je exacte locatie wordt gedeeld met hulpverleners in de buurt (max 15km)
          </p>
        </div>

        {/* Slide to Call 112 */}
        {showSlideToCall && (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm"
            >
              <p className="text-white text-center mb-6 font-semibold text-lg">
                Schuif om 112 te bellen
              </p>
              
              <div className="relative bg-white/20 rounded-full h-16 overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-white/30 transition-all duration-100"
                  style={{ width: `${slideProgress}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slideProgress}
                  onChange={handleSlideChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 flex items-center justify-center"
                  style={{ left: `calc(${Math.min(slideProgress, 85)}% + 8px)` }}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-destructive" />
                  </div>
                </div>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white font-bold">
                  112
                </span>
              </div>

              <p className="text-white/70 text-center mt-4 text-sm">
                Directe verbinding met de noodcentrale
              </p>
            </motion.div>
          </div>
        )}

        {/* Nearby Users */}
        <div className="p-4 bg-black/10">
          <h3 className="text-white font-semibold mb-3">
            {nearbyUsers.length} mensen in de buurt verwittigd
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {nearbyUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-white/10 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-semibold">{user.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-white/70 text-xs">{user.distance} km afstand</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </button>
                  <a 
                    href={`tel:+32000000000`}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
                  >
                    <PhoneCall className="w-5 h-5 text-destructive" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="p-4 pb-8">
          <button
            onClick={cancelEmergency}
            className="w-full py-4 bg-white/20 text-white rounded-2xl font-semibold hover:bg-white/30 transition-colors"
          >
            ❌ Vals alarm - Signaal uitzetten
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Zone 4: Safety Layer - Floating Emergency Button (bottom, above nav) */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-24 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-200 active:scale-95 ${
          isHovered 
            ? 'bg-destructive scale-110' 
            : 'bg-secondary hover:scale-110'
        }`}
        aria-label="Noodhulp"
      >
        <AlertTriangle className={`w-5 h-5 transition-colors ${
          isHovered ? 'text-white' : 'text-secondary-foreground'
        }`} />
      </button>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                Noodhulp
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Voel je je onveilig? We staan klaar om te helpen. Kies een optie hieronder.
              </p>

              <div className="space-y-3">
                <button
                  onClick={startEmergency}
                  className="flex items-center gap-4 w-full p-4 bg-destructive text-white rounded-xl font-semibold hover:brightness-110 transition-all"
                >
                  <AlertTriangle className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Activeer Noodsignaal</p>
                    <p className="text-sm opacity-80">Waarschuw mensen in de buurt</p>
                  </div>
                </button>

                <a
                  href="tel:112"
                  className="flex items-center gap-4 w-full p-4 bg-accent/15 text-accent-foreground rounded-xl font-semibold hover:bg-accent/25 transition-all"
                >
                  <Phone className="w-6 h-6 text-accent" />
                  <div className="text-left">
                    <p className="font-bold">Bel 112</p>
                    <p className="text-sm opacity-80">Directe lijn noodcentrale</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
