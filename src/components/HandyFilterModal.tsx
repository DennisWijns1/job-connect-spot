import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search as SearchIcon, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/data/mockData';

interface HandyFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const hourlyRateOptions = [20, 30, 40, 50];

export const HandyFilterModal = ({ isOpen, onClose }: HandyFilterModalProps) => {
  const [locationSearch, setLocationSearch] = useState('');
  const [minHourlyRate, setMinHourlyRate] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

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
        <div className="sticky top-0 bg-secondary px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-secondary-foreground">
            Filter Projecten
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-secondary-foreground hover:bg-primary/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Location Search */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Locatie
            </h3>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Zoek op stad of gemeente..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10 h-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Quick location suggestions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['Leuven', 'Heverlee', 'Kessel-Lo', 'Wijgmaal'].map((loc) => (
                <Badge
                  key={loc}
                  variant={locationSearch === loc ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-3"
                  onClick={() => setLocationSearch(loc)}
                >
                  {loc}
                </Badge>
              ))}
            </div>
          </div>

          {/* Minimum Hourly Rate */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Minimum uurtarief
            </h3>
            <div className="flex gap-2">
              {hourlyRateOptions.map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMinHourlyRate(minHourlyRate === rate ? null : rate)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    minHourlyRate === rate
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-primary/10'
                  }`}
                >
                  €{rate}/u
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Kies je gewenste minimum tarief als handy
            </p>
          </div>

          {/* Categories with Search */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Specialiteit</h3>
            
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Zoek specialiteit..."
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
                <p className="text-muted-foreground text-sm">
                  Geen specialiteiten gevonden voor "{searchQuery}"
                </p>
              )}
            </div>
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
