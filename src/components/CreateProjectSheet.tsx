import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Camera, 
  MapPin, 
  Send,
  X,
  Loader2,
  Euro
} from 'lucide-react';

interface CreateProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  'Loodgieter', 'Elektricien', 'Schilder', 'Tuinman', 
  'Timmerman', 'Metselaar', 'Dakdekker', 'Stukadoor', 'Andere'
];

const urgencyOptions = [
  { value: 'low', label: 'Niet dringend', color: 'bg-success/10 text-success' },
  { value: 'medium', label: 'Gemiddeld', color: 'bg-accent/10 text-accent' },
  { value: 'high', label: 'Dringend!', color: 'bg-destructive/10 text-destructive' },
];

export const CreateProjectSheet = ({ isOpen, onClose }: CreateProjectSheetProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>('fixed');
  const [maxBudget, setMaxBudget] = useState([250]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Geef je project een titel');
      return;
    }
    if (!category) {
      toast.error('Kies een categorie');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Project geplaatst!', {
      description: 'Handy\'s in de buurt kunnen je nu contacteren',
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('');
    setUrgency('medium');
    setPhotos([]);
    setLoading(false);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <Send className="w-5 h-5 text-accent" />
            Project plaatsen
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-140px)] space-y-5 pb-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Wat moet er gebeuren? *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="bv. Lekkende kraan repareren"
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Omschrijving</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschrijf het probleem of de klus..."
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categorie *</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-3 transition-all"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label>Hoe dringend?</Label>
            <div className="flex gap-2">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setUrgency(opt.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    urgency === opt.value 
                      ? opt.color + ' ring-2 ring-offset-2 ring-current' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget / Hourly Rate */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Maximaal budget
            </Label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setBudgetType('fixed');
                  setMaxBudget([250]);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  budgetType === 'fixed'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Vast budget
              </button>
              <button
                onClick={() => {
                  setBudgetType('hourly');
                  setMaxBudget([50]);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  budgetType === 'hourly'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Uurtarief
              </button>
            </div>
            <Slider
              value={maxBudget}
              onValueChange={setMaxBudget}
              max={budgetType === 'fixed' ? 500 : 100}
              step={budgetType === 'fixed' ? 25 : 5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>€0{budgetType === 'hourly' ? '/uur' : ''}</span>
              <span className="font-semibold text-lg text-foreground">
                €{maxBudget[0]}{budgetType === 'hourly' ? '/uur' : ''}
              </span>
              <span>€{budgetType === 'fixed' ? '500' : '100'}{budgetType === 'hourly' ? '/uur' : ''}</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Locatie</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Stad of postcode"
                className="rounded-xl pl-10"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label>Foto's (optioneel)</Label>
            <div className="flex gap-3 flex-wrap">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Toevoegen</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-accent to-accent/80 text-white font-semibold text-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Project plaatsen
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
