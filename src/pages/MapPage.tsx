import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EmergencyButton } from '@/components/EmergencyButton';
import { mockHandyProfiles, mockProjects } from '@/data/mockData';
import { MessageCircle, Hammer, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const onlineHandys = mockHandyProfiles.filter(h => h.isOnline);

// Leuven landmarks and streets
const leuvenStreets = [
  { name: 'Bondgenotenlaan', x1: 50, y1: 200, x2: 350, y2: 200 },
  { name: 'Naamsestraat', x1: 200, y1: 50, x2: 200, y2: 350 },
  { name: 'Tiensestraat', x1: 200, y1: 200, x2: 380, y2: 50 },
  { name: 'Diestsestraat', x1: 200, y1: 200, x2: 380, y2: 350 },
];

const landmarks = [
  { name: 'Grote Markt', x: 200, y: 200, emoji: '🏛️' },
  { name: 'KU Leuven', x: 160, y: 120, emoji: '🎓' },
  { name: 'Station', x: 300, y: 320, emoji: '🚂' },
  { name: 'Stadspark', x: 100, y: 280, emoji: '🌳' },
];

// Mock coordinates for handys (for seekers)
const handyLocations = [
  { ...onlineHandys[0], top: '28%', left: '48%' },
  { ...onlineHandys[1], top: '18%', left: '65%' },
  { ...onlineHandys[2], top: '48%', left: '28%' },
  { ...onlineHandys[3], top: '38%', left: '72%' },
  { ...onlineHandys[4], top: '62%', left: '55%' },
].filter(h => h?.isOnline);

// Mock coordinates for projects (for handymen)
const projectLocations = mockProjects.map((project, index) => ({
  ...project,
  top: `${20 + (index * 15) % 50}%`,
  left: `${25 + (index * 18) % 55}%`,
}));

const urgencyColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent text-accent-foreground',
  high: 'bg-destructive text-destructive-foreground',
};

const MapPage = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isSeeker = userType === 'seeker';
  const isHandy = userType === 'handy';

  const handleStartChat = (id: string, name: string) => {
    navigate('/chats', { state: { newChatWith: id, handyName: name } });
  };

  const handleApplyForProject = (projectTitle: string) => {
    toast.success(`Je hebt je aangeboden voor "${projectTitle}"!`, {
      description: 'De klant ontvangt je aanvraag',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Kaart" showFavorites />

      <div className="relative h-[calc(100vh-180px)] mx-4 mt-4 rounded-3xl overflow-hidden shadow-card">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          {/* Grid pattern for streets */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            {/* Background blocks/buildings */}
            <rect x="50" y="50" width="80" height="60" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            <rect x="150" y="80" width="40" height="50" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            <rect x="250" y="60" width="70" height="80" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            <rect x="60" y="150" width="50" height="40" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            <rect x="280" y="180" width="60" height="50" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            <rect x="80" y="250" width="90" height="70" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            <rect x="220" y="280" width="80" height="60" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            <rect x="320" y="250" width="50" height="40" fill="hsl(var(--muted))" opacity="0.1" rx="4" />
            
            {/* Main streets */}
            {leuvenStreets.map((street, i) => (
              <line
                key={i}
                x1={street.x1}
                y1={street.y1}
                x2={street.x2}
                y2={street.y2}
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                opacity="0.2"
                strokeLinecap="round"
              />
            ))}
            
            {/* Secondary streets */}
            <path d="M80 100 L320 100" stroke="hsl(var(--secondary))" strokeWidth="3" opacity="0.15" />
            <path d="M80 300 L320 300" stroke="hsl(var(--secondary))" strokeWidth="3" opacity="0.15" />
            <path d="M100 80 L100 320" stroke="hsl(var(--secondary))" strokeWidth="3" opacity="0.15" />
            <path d="M300 80 L300 320" stroke="hsl(var(--secondary))" strokeWidth="3" opacity="0.15" />
            
            {/* Kleine Ring road */}
            <circle cx="200" cy="200" r="120" fill="none" stroke="hsl(var(--accent))" strokeWidth="4" opacity="0.15" strokeDasharray="10 5" />
            
            {/* Park areas */}
            <circle cx="100" cy="280" r="35" fill="hsl(142 71% 45%)" opacity="0.15" />
            <ellipse cx="320" cy="120" rx="30" ry="25" fill="hsl(142 71% 45%)" opacity="0.15" />
          </svg>
          
          {/* Landmarks */}
          {landmarks.map((landmark) => (
            <div
              key={landmark.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ top: `${(landmark.y / 400) * 100}%`, left: `${(landmark.x / 400) * 100}%` }}
            >
              <span className="text-2xl">{landmark.emoji}</span>
              <span className="text-[10px] font-medium text-muted-foreground bg-card/80 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                {landmark.name}
              </span>
            </div>
          ))}
          
          {/* City label */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-card border border-border">
            <p className="font-display font-bold text-primary text-lg">Leuven</p>
            <p className="text-xs text-muted-foreground">
              {isHandy ? 'Projecten in de buurt' : 'Centrum • Live'}
            </p>
          </div>
        </div>

        {/* Handy Markers (for seekers) */}
        {isSeeker && handyLocations.map((handy) => handy && (
          <div
            key={handy.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            style={{ top: handy.top, left: handy.left }}
          >
            {/* Pulse animation */}
            <div className="absolute inset-0 w-14 h-14 -m-1 rounded-full bg-accent/30 animate-ping" />
            
            {/* Avatar marker */}
            <div className="relative transition-transform duration-200 group-hover:scale-110">
              <div className="w-12 h-12 rounded-full border-4 border-card shadow-card-hover overflow-hidden bg-card">
                <img
                  src={handy.avatar}
                  alt={handy.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
            </div>

            {/* Popup on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="bg-card rounded-2xl shadow-card-hover p-4 min-w-[200px] border border-border">
                <div className="text-center">
                  <p className="font-bold text-sm text-foreground">{handy.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{handy.specialty}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-xs font-medium text-foreground">{handy.rating}</span>
                    <span className="text-sm">🔨</span>
                    <span className="text-xs text-muted-foreground">({handy.reviewCount})</span>
                  </div>
                  {handy.hourlyRate && (
                    <p className="text-sm font-bold text-accent mt-2">€{handy.hourlyRate}/uur</p>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartChat(handy.id, handy.name);
                    }}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Start Chat
                  </button>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card" />
              </div>
            </div>
          </div>
        ))}

        {/* Project Markers (for handymen) */}
        {isHandy && projectLocations.map((project) => (
          <div
            key={project.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            style={{ top: project.top, left: project.left }}
          >
            {/* Pulse animation for urgent */}
            {project.urgency === 'high' && (
              <div className="absolute inset-0 w-14 h-14 -m-1 rounded-full bg-destructive/30 animate-ping" />
            )}
            
            {/* Project marker */}
            <div className="relative transition-transform duration-200 group-hover:scale-110">
              <div className={`w-12 h-12 rounded-full border-4 border-card shadow-card-hover flex items-center justify-center ${
                project.urgency === 'high' ? 'bg-destructive' : 'bg-primary'
              }`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Popup on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="bg-card rounded-2xl shadow-card-hover p-4 min-w-[220px] border border-border">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-bold text-sm text-foreground line-clamp-2">{project.title}</p>
                    <Badge className={`text-[10px] ${urgencyColors[project.urgency]} shrink-0`}>
                      {project.urgency === 'high' ? 'Dringend' : project.urgency === 'medium' ? 'Normaal' : 'Rustig'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{project.location}</p>
                  <Badge variant="outline" className="text-xs mb-3">{project.category}</Badge>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyForProject(project.title);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Hammer className="w-4 h-4" />
                    Bied aan
                  </button>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card" />
              </div>
            </div>
          </div>
        ))}

        {/* Your location indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 rounded-full bg-primary border-4 border-card shadow-lg">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary bg-card/90 px-2 py-0.5 rounded-full whitespace-nowrap">
            Jij
          </span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-card border border-border">
          {isSeeker ? (
            <>
              <p className="text-sm font-semibold text-foreground mb-1">
                🔨 {handyLocations.length} Handy's online in Leuven
              </p>
              <p className="text-xs text-muted-foreground">
                Hover over een marker om te chatten
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground mb-1">
                📍 {projectLocations.length} Projecten in de buurt
              </p>
              <p className="text-xs text-muted-foreground">
                Hover over een marker om je aan te bieden
              </p>
            </>
          )}
        </div>
      </div>

      {isSeeker && <EmergencyButton />}
      <BottomNav />
    </div>
  );
};

export default MapPage;
