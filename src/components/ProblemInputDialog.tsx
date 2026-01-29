import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Lightbulb, MapPin, Euro, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/data/mockData';

interface ProblemInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problem: string) => void;
}

const suggestionPrompts = [
  { icon: '🔧', text: 'De kraan lekt' },
  { icon: '💡', text: 'Lamp werkt niet meer' },
  { icon: '🌿', text: 'Tuin moet gemaaid worden' },
  { icon: '🎨', text: 'Muur moet geschilderd worden' },
];

const locations = ['Leuven', 'Heverlee', 'Kessel-Lo', 'Wijgmaal', 'Brussel', 'Antwerpen', 'Gent'];

export const ProblemInputDialog = ({ isOpen, onClose, onSubmit }: ProblemInputDialogProps) => {
  const [problem, setProblem] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [locationSearch, setLocationSearch] = useState('');
  const [distanceKm, setDistanceKm] = useState([15]);
  const [hourlyRate, setHourlyRate] = useState([20, 60]);
  const [minRating, setMinRating] = useState([3]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSubmit = () => {
    if (problem.trim()) {
      onSubmit(problem.trim());
      setProblem('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion);
    setProblem('');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredLocations = locations.filter(loc =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Dialog - Bottom sheet style */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-card-hover max-h-[85vh] overflow-y-auto border-t border-border"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-muted" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="px-5 pb-6">
              {/* Title */}
              <div className="mb-4 pr-8">
                <h2 className="font-display font-bold text-lg text-foreground">
                  Wat is je probleem?
                </h2>
                <p className="text-muted-foreground text-sm">
                  Beschrijf je probleem en we filteren de beste handy's
                </p>
              </div>

              {/* Search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Bijv. 'de kraan lekt'"
                  className="pl-10 pr-4 h-12 text-sm rounded-xl border-border focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {/* Suggestions */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Populaire problemen</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestionPrompts.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <span className="text-base">{suggestion.icon}</span>
                      <span className="text-xs text-foreground group-hover:text-primary transition-colors">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors mb-4"
              >
                <span className="text-sm font-medium text-foreground">
                  Geavanceerde filters
                </span>
                {showFilters ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Filters Section */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 mb-4">
                      {/* Location with Distance */}
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Locatie & Afstand
                        </h3>
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Zoek stad of gemeente..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            className="pl-10 h-10 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground text-sm"
                          />
                        </div>
                        
                        {locationSearch && filteredLocations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {filteredLocations.slice(0, 4).map((loc) => (
                              <Badge
                                key={loc}
                                variant="outline"
                                className="cursor-pointer py-1.5 px-3 text-xs hover:bg-primary/10"
                                onClick={() => setLocationSearch(loc)}
                              >
                                {loc}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="bg-background rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Max afstand</span>
                            <span className="text-xs font-semibold text-primary">{distanceKm[0]} km</span>
                          </div>
                          <Slider
                            value={distanceKm}
                            onValueChange={setDistanceKm}
                            max={50}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Minimum Rating */}
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          Minimum beoordeling
                        </h3>
                        <div className="bg-background rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Minimaal</span>
                            <span className="text-xs font-semibold text-accent flex items-center gap-1">
                              {minRating[0]} <span>🔨</span>
                            </span>
                          </div>
                          <Slider
                            value={minRating}
                            onValueChange={setMinRating}
                            max={5}
                            min={1}
                            step={0.5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Hourly Rate */}
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                          <Euro className="w-4 h-4 text-primary" />
                          Uurtarief
                        </h3>
                        <div className="bg-background rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Bereik</span>
                            <span className="text-xs font-semibold text-primary">
                              €{hourlyRate[0]} - €{hourlyRate[1]}/uur
                            </span>
                          </div>
                          <Slider
                            value={hourlyRate}
                            onValueChange={setHourlyRate}
                            max={100}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2">Specialiteit</h3>
                        <div className="flex flex-wrap gap-2">
                          {categories.slice(0, 6).map((category) => (
                            <Badge
                              key={category}
                              variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                              className={`cursor-pointer py-1.5 px-3 text-xs ${
                                selectedCategories.includes(category)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-primary/10'
                              }`}
                              onClick={() => toggleCategory(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={!problem.trim()}
                className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 hover:brightness-110"
              >
                <Search className="w-4 h-4 mr-2" />
                Zoek Handy's
              </Button>

              {/* Skip button */}
              <button
                onClick={onClose}
                className="w-full py-3 text-muted-foreground text-xs hover:text-foreground transition-colors"
              >
                Overslaan en direct beginnen swipen →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
