import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search as SearchIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { categories } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterModal = ({ isOpen, onClose }: FilterModalProps) => {
  const [minRating, setMinRating] = useState([3]);
  const [maxDistance, setMaxDistance] = useState([10]);
  const [maxHourlyRate, setMaxHourlyRate] = useState([50]);
  const [professionalOnly, setProfessionalOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto safe-area-bottom"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-foreground">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Categories with Search */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Categorie</h3>
            
            {/* Search input */}
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Zoek specifiek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filteredCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className={`cursor-pointer py-2 px-4 ${
                    selectedCategories.includes(category)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/10'
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
              {filteredCategories.length === 0 && searchQuery && (
                <p className="text-muted-foreground text-sm">Geen categorieën gevonden voor "{searchQuery}"</p>
              )}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Minimum beoordeling</h3>
              <span className="text-primary font-bold">{minRating[0]} 🔨</span>
            </div>
            <Slider
              value={minRating}
              onValueChange={setMinRating}
              min={1}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Max Distance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Maximum afstand</h3>
              <span className="text-primary font-bold">{maxDistance[0]} km</span>
            </div>
            <Slider
              value={maxDistance}
              onValueChange={setMaxDistance}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Max Hourly Rate */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Maximum uurtarief</h3>
              <span className="text-primary font-bold">€{maxHourlyRate[0]}</span>
            </div>
            <Slider
              value={maxHourlyRate}
              onValueChange={setMaxHourlyRate}
              min={10}
              max={150}
              step={5}
              className="w-full"
            />
          </div>

          {/* Professional Only */}
          <div className="flex items-center justify-between p-4 bg-background rounded-2xl">
            <div>
              <h3 className="font-semibold text-foreground">Alleen professionals</h3>
              <p className="text-muted-foreground text-sm">Bedrijven met BTW-nummer</p>
            </div>
            <Switch
              checked={professionalOnly}
              onCheckedChange={setProfessionalOnly}
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl btn-cta font-semibold text-lg"
          >
            Filters toepassen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
