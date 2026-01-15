import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EmergencyButton } from '@/components/EmergencyButton';
import { mockHandyProfiles } from '@/data/mockData';
import { MapPin, Star, Phone } from 'lucide-react';

const onlineHandys = mockHandyProfiles.filter(h => h.isOnline);

// Mock coordinates around Leuven
const handyLocations = [
  { ...onlineHandys[0], lat: 50.8798, lng: 4.7005, top: '25%', left: '45%' },
  { ...onlineHandys[1], lat: 50.8850, lng: 4.7100, top: '18%', left: '62%' },
  { ...onlineHandys[2], lat: 50.8720, lng: 4.6900, top: '45%', left: '30%' },
  { ...onlineHandys[3], lat: 50.8900, lng: 4.6850, top: '35%', left: '70%' },
  { ...onlineHandys[4], lat: 50.8650, lng: 4.7200, top: '60%', left: '55%' },
].filter(h => h?.isOnline);

const MapPage = () => {
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isSeeker = userType === 'seeker';

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Kaart" showFilters />

      <div className="relative h-[calc(100vh-180px)] mx-4 mt-4 rounded-3xl overflow-hidden shadow-card">
        {/* Map Background - Stylized Leuven Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-slate-100">
          {/* Streets pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400">
            {/* Main roads */}
            <path d="M0 200 L400 200" stroke="#94a3b8" strokeWidth="8" fill="none" />
            <path d="M200 0 L200 400" stroke="#94a3b8" strokeWidth="8" fill="none" />
            <path d="M50 50 L350 350" stroke="#cbd5e1" strokeWidth="4" fill="none" />
            <path d="M350 50 L50 350" stroke="#cbd5e1" strokeWidth="4" fill="none" />
            {/* Secondary roads */}
            <path d="M100 0 L100 400" stroke="#e2e8f0" strokeWidth="2" fill="none" />
            <path d="M300 0 L300 400" stroke="#e2e8f0" strokeWidth="2" fill="none" />
            <path d="M0 100 L400 100" stroke="#e2e8f0" strokeWidth="2" fill="none" />
            <path d="M0 300 L400 300" stroke="#e2e8f0" strokeWidth="2" fill="none" />
            {/* Park areas */}
            <circle cx="150" cy="150" r="40" fill="#86efac" opacity="0.3" />
            <circle cx="300" cy="280" r="50" fill="#86efac" opacity="0.3" />
          </svg>
          
          {/* City label */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
            <p className="font-display font-bold text-primary">Leuven</p>
            <p className="text-xs text-secondary">Centrum</p>
          </div>
        </div>

        {/* Handy Markers */}
        {handyLocations.map((handy) => handy && (
          <div
            key={handy.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            style={{ top: handy.top, left: handy.left }}
          >
            {/* Pulse animation */}
            <div className="absolute inset-0 w-14 h-14 -m-1 rounded-full bg-accent/30 animate-ping" />
            
            {/* Avatar marker */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img
                  src={handy.avatar}
                  alt={handy.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white" />
            </div>

            {/* Popup on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="bg-white rounded-2xl shadow-card-hover p-4 min-w-[180px]">
                <div className="text-center">
                  <p className="font-bold text-sm text-foreground">{handy.name}</p>
                  <p className="text-xs text-secondary mt-0.5">{handy.specialty}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-xs font-medium">{handy.rating}</span>
                    <span className="text-sm">🔨</span>
                    <span className="text-xs text-muted">({handy.reviewCount})</span>
                  </div>
                  {handy.hourlyRate && (
                    <p className="text-sm font-bold text-accent mt-2">€{handy.hourlyRate}/uur</p>
                  )}
                  <button className="mt-3 w-full py-2 bg-accent text-accent-foreground rounded-xl text-xs font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3" />
                    Contact
                  </button>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
              </div>
            </div>
          </div>
        ))}

        {/* Your location indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 rounded-full bg-primary border-4 border-white shadow-lg">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-card">
          <p className="text-sm font-semibold text-foreground mb-2">
            🔨 {handyLocations.length} Handy's online in de buurt
          </p>
          <p className="text-xs text-muted-foreground">
            Hover over een marker om details te zien en contact op te nemen
          </p>
        </div>
      </div>

      {isSeeker && <EmergencyButton />}
      <BottomNav />
    </div>
  );
};

export default MapPage;
