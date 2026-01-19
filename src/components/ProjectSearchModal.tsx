import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Euro, Briefcase } from 'lucide-react';

interface ProjectSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: ProjectFilters) => void;
}

export interface ProjectFilters {
  specialty: string;
  location: string;
  maxDistance: number;
  minBudget: number;
  maxBudget: number;
}

export const ProjectSearchModal = ({ isOpen, onClose, onSearch }: ProjectSearchModalProps) => {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [maxDistance, setMaxDistance] = useState([25]);
  const [budgetRange, setBudgetRange] = useState([0, 500]);

  const specialties = [
    'Loodgieter',
    'Elektricien',
    'Schilder',
    'Tuinman',
    'Timmerman',
    'Metselaar',
    'Dakdekker',
    'Stukadoor',
  ];

  const handleSearch = () => {
    onSearch({
      specialty,
      location,
      maxDistance: maxDistance[0],
      minBudget: budgetRange[0],
      maxBudget: budgetRange[1],
    });
    onClose();
  };

  const handleReset = () => {
    setSpecialty('');
    setLocation('');
    setMaxDistance([25]);
    setBudgetRange([0, 500]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Projecten zoeken
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Specialty */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Specialiteit
            </label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSpecialty(specialty === spec ? '' : spec)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    specialty === spec
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Locatie
            </label>
            <Input
              placeholder="Stad of postcode"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Distance slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Maximale afstand
              </label>
              <span className="text-sm text-primary font-semibold">
                {maxDistance[0]} km
              </span>
            </div>
            <Slider
              value={maxDistance}
              onValueChange={setMaxDistance}
              min={1}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Budget range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Euro className="w-4 h-4 text-primary" />
                Budget
              </label>
              <span className="text-sm text-primary font-semibold">
                €{budgetRange[0]} - €{budgetRange[1]}
              </span>
            </div>
            <Slider
              value={budgetRange}
              onValueChange={setBudgetRange}
              min={0}
              max={2000}
              step={25}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€0</span>
              <span>€2000+</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl">
            Reset
          </Button>
          <Button onClick={handleSearch} className="flex-1 rounded-xl bg-primary">
            <Search className="w-4 h-4 mr-2" />
            Zoeken
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
