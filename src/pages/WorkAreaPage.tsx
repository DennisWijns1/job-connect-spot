import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { MapPin, Save, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const STORAGE_KEY = 'handymatch_workarea';

interface WorkArea {
  centerAddress: string;
  centerCity: string;
  radiusKm: number;
}

const defaultWorkArea: WorkArea = {
  centerAddress: 'Martensstraat 39, Averbode',
  centerCity: 'Averbode',
  radiusKm: 25,
};

const getStoredWorkArea = (): WorkArea => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultWorkArea;
};

const nearbyAreas = [
  { name: 'Diest', distance: 12 },
  { name: 'Aarschot', distance: 18 },
  { name: 'Hasselt', distance: 35 },
  { name: 'Leuven', distance: 40 },
  { name: 'Tienen', distance: 28 },
  { name: 'Beringen', distance: 22 },
  { name: 'Herentals', distance: 42 },
  { name: 'Turnhout', distance: 55 },
];

const WorkAreaPage = () => {
  const [workArea, setWorkArea] = useState<WorkArea>(getStoredWorkArea);
  const [saved, setSaved] = useState(true);

  const reachableAreas = nearbyAreas.filter(a => a.distance <= workArea.radiusKm);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workArea));
    setSaved(true);
    toast.success('Werkgebied opgeslagen!');
  };

  const updateRadius = (value: number[]) => {
    setWorkArea(prev => ({ ...prev, radiusKm: value[0] }));
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Werkgebied" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* Map Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden"
        >
          <div className="relative h-56 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
            {/* Simplified map visualization */}
            <div className="relative">
              {/* Radius circle */}
              <div
                className="rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center transition-all duration-500"
                style={{
                  width: `${Math.min(200, 60 + workArea.radiusKm * 2.5)}px`,
                  height: `${Math.min(200, 60 + workArea.radiusKm * 2.5)}px`,
                }}
              >
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg" />
              </div>
              {/* Nearby dots */}
              {nearbyAreas.map((area, i) => {
                const angle = (i / nearbyAreas.length) * Math.PI * 2;
                const scale = Math.min(1, workArea.radiusKm / 60);
                const dist = 30 + area.distance * scale * 1.5;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                const inRange = area.distance <= workArea.radiusKm;
                return (
                  <div
                    key={area.name}
                    className={`absolute text-[10px] font-medium transition-all duration-300 ${
                      inRange ? 'text-primary' : 'text-muted-foreground/40'
                    }`}
                    style={{
                      left: `calc(50% + ${x}px - 20px)`,
                      top: `calc(50% + ${y}px - 8px)`,
                      width: 40,
                      textAlign: 'center',
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full mx-auto mb-0.5 ${
                      inRange ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`} />
                    {area.name}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Center Address */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Startpunt</Label>
              <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <Input
                  value={workArea.centerAddress}
                  onChange={(e) => {
                    setWorkArea(prev => ({ ...prev, centerAddress: e.target.value }));
                    setSaved(false);
                  }}
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  placeholder="Je adres"
                />
              </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">Actieradius</Label>
                <span className="text-lg font-bold text-primary">{workArea.radiusKm} km</span>
              </div>
              <Slider
                value={[workArea.radiusKm]}
                onValueChange={updateRadius}
                min={5}
                max={75}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 km</span>
                <span>25 km</span>
                <span>50 km</span>
                <span>75 km</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reachable Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl border border-border shadow-soft p-5"
        >
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Bereikbare gebieden ({reachableAreas.length})
          </h3>
          {reachableAreas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {reachableAreas.map(area => (
                <span
                  key={area.name}
                  className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  {area.name} ({area.distance} km)
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Verhoog je radius om gebieden te bereiken.</p>
          )}

          {nearbyAreas.filter(a => a.distance > workArea.radiusKm).length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Buiten bereik:</p>
              <div className="flex flex-wrap gap-2">
                {nearbyAreas.filter(a => a.distance > workArea.radiusKm).map(area => (
                  <span
                    key={area.name}
                    className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full"
                  >
                    {area.name} ({area.distance} km)
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saved}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'Opgeslagen ✓' : 'Werkgebied opslaan'}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkAreaPage;
