import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Camera, Upload, X, CalendarIcon, Hammer, User, Building2, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'loodgieter', label: '🔧 Loodgieter' },
  { value: 'elektricien', label: '⚡ Elektricien' },
  { value: 'schilder', label: '🎨 Schilder' },
  { value: 'timmerman', label: '🪚 Timmerman' },
  { value: 'tuin', label: '🌿 Tuin' },
  { value: 'dak', label: '🏠 Dak' },
  { value: 'badkamer', label: '🚿 Badkamer' },
  { value: 'keuken', label: '🍳 Keuken' },
  { value: 'vloer', label: '🪵 Vloer' },
  { value: 'isolatie', label: '🧱 Isolatie' },
  { value: 'overig', label: '📦 Overig' },
];

const PERFORMERS = [
  { value: 'zelf', label: 'Zelf gedaan', icon: User },
  { value: 'handyman', label: 'Handyman', icon: Hammer },
  { value: 'aannemer', label: 'Aannemer', icon: Building2 },
];

interface AddKlusEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (entry: {
    title: string;
    description: string | null;
    category: string;
    performed_by: string;
    handyman_name: string | null;
    date_performed: string;
    photos: string[];
    cost: number | null;
    address: string | null;
    notes: string | null;
  }) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string | null>;
}

const AddKlusEntrySheet = ({ open, onOpenChange, onSubmit, uploadPhoto }: AddKlusEntrySheetProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('overig');
  const [performedBy, setPerformedBy] = useState('zelf');
  const [handymanName, setHandymanName] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [photos, setPhotos] = useState<string[]>([]);
  const [cost, setCost] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('overig');
    setPerformedBy('zelf'); setHandymanName(''); setDate(new Date());
    setPhotos([]); setCost(''); setAddress(''); setNotes('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    for (const file of Array.from(files)) {
      const url = await uploadPhoto(file);
      if (url) setPhotos(prev => [...prev, url]);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Geef een titel op');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        category,
        performed_by: performedBy,
        handyman_name: performedBy !== 'zelf' ? handymanName.trim() || null : null,
        date_performed: format(date, 'yyyy-MM-dd'),
        photos,
        cost: cost ? parseFloat(cost) : null,
        address: address.trim() || null,
        notes: notes.trim() || null,
      });
      resetForm();
      onOpenChange(false);
      toast.success('Klus toegevoegd aan je paspoort!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl overflow-y-auto pb-safe">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-display font-bold text-foreground">
            Nieuwe klus registreren
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-8">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Titel *</label>
            <Input
              placeholder="Bijv. Badkamer betegeld"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Categorie</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    category === cat.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Performed by */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Uitgevoerd door</label>
            <div className="grid grid-cols-3 gap-2">
              {PERFORMERS.map(p => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPerformedBy(p.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl text-sm font-medium transition-all border',
                      performedBy === p.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Handyman name */}
          <AnimatePresence>
            {performedBy !== 'zelf' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Naam {performedBy === 'handyman' ? 'handyman' : 'aannemer'}
                </label>
                <Input
                  placeholder="Naam van de vakman"
                  value={handymanName}
                  onChange={e => setHandymanName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Datum</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 rounded-xl justify-start font-normal">
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {format(date, 'd MMMM yyyy', { locale: nl })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={d => d && setDate(d)}
                  disabled={d => d > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Cost */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Kosten (€)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Beschrijving</label>
            <Textarea
              placeholder="Wat is er precies gedaan?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Foto's</label>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {isUploading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5">Foto</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Adres / locatie</label>
            <Input
              placeholder="Bijv. Keuken, Zolder, Thuis"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Extra notities</label>
            <Textarea
              placeholder="Garantie, materialen, tips..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl text-base font-semibold"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Klus opslaan
              </span>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddKlusEntrySheet;
