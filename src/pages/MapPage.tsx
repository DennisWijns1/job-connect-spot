import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EmergencyButton } from '@/components/EmergencyButton';
import { mockHandyProfiles } from '@/data/mockData';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const onlineHandys = mockHandyProfiles.filter(h => h.isOnline);

// Mock coordinates around Leuven
const handyLocations = [
  { ...onlineHandys[0], lat: 50.8798, lng: 4.7005 },
  { ...onlineHandys[1], lat: 50.8850, lng: 4.7100 },
  { ...onlineHandys[2], lat: 50.8720, lng: 4.6900 },
  { ...onlineHandys[3], lat: 50.8900, lng: 4.6850 },
  { ...onlineHandys[4], lat: 50.8650, lng: 4.7200 },
].filter(h => h?.isOnline);

const MapPage = () => {
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isSeeker = userType === 'seeker';

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Kaart" showFilters />

      <div className="relative h-[calc(100vh-180px)]">
        <MapContainer
          center={[50.8798, 4.7005]}
          zoom={14}
          className="h-full w-full z-0"
          style={{ background: 'hsl(var(--background))' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {handyLocations.map((handy) => handy && (
            <Marker
              key={handy.id}
              position={[handy.lat, handy.lng]}
            >
              <Popup>
                <div className="text-center">
                  <img
                    src={handy.avatar}
                    alt={handy.name}
                    className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                  />
                  <p className="font-bold text-sm">{handy.name}</p>
                  <p className="text-xs text-gray-600">{handy.specialty}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xs font-medium">{handy.rating} 🔨</span>
                    <span className="text-xs text-gray-500">({handy.reviewCount})</span>
                  </div>
                  {handy.hourlyRate && (
                    <p className="text-xs font-bold mt-1">€{handy.hourlyRate}/uur</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-card z-10">
          <p className="text-sm font-semibold text-foreground mb-2">
            {handyLocations.length} Handy's online in de buurt
          </p>
          <p className="text-xs text-muted-foreground">
            Klik op een marker om details te zien en contact op te nemen
          </p>
        </div>
      </div>

      {isSeeker && <EmergencyButton />}
      <BottomNav />
    </div>
  );
};

export default MapPage;
