import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  ArrowLeft, Plus, Search, Filter, ClipboardList,
  Hammer, User, Building2, Trash2, ChevronRight,
  Camera, Calendar as CalendarIcon, FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useKluspaspoort, KluspaspoortEntry } from '@/hooks/useKluspaspoort';
import AddKlusEntrySheet from '@/components/AddKlusEntrySheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORY_EMOJI: Record<string, string> = {
  loodgieter: '🔧', elektricien: '⚡', schilder: '🎨',
  timmerman: '🪚', tuin: '🌿', dak: '🏠', badkamer: '🚿',
  keuken: '🍳', vloer: '🪵', isolatie: '🧱', overig: '📦',
};

const PERFORMER_ICON: Record<string, typeof User> = {
  zelf: User, handyman: Hammer, aannemer: Building2,
};

const KluspaspoortPage = () => {
  const navigate = useNavigate();
  const { entries, isLoading, addEntry, deleteEntry, uploadPhoto } = useKluspaspoort();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCost = filteredEntries.reduce((sum, e) => sum + (e.cost || 0), 0);
  const categories = [...new Set(entries.map(e => e.category))];

  const handleDelete = async (id: string) => {
    const { error } = await deleteEntry(id);
    if (error) toast.error('Kon klus niet verwijderen');
    else toast.success('Klus verwijderd');
  };

  const handleAddEntry = async (entry: Omit<KluspaspoortEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const result = await addEntry(entry);
    if (result?.error) toast.error('Kon klus niet opslaan');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">Kluspaspoort</h1>
            <p className="text-xs text-muted-foreground">Digitaal logboek van je woning</p>
          </div>
          <Button
            onClick={() => setShowAddSheet(true)}
            size="sm"
            className="rounded-xl gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Klus
          </Button>
        </div>
      </div>

      {/* Stats banner */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <div className="text-2xl font-bold text-primary">{entries.length}</div>
            <div className="text-xs text-muted-foreground">Klussen</div>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <div className="text-2xl font-bold text-accent">€{totalCost.toLocaleString('nl-NL')}</div>
            <div className="text-xs text-muted-foreground">Totaal</div>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <div className="text-2xl font-bold text-foreground">{categories.length}</div>
            <div className="text-xs text-muted-foreground">Categorieën</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 pb-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek in je klussen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                !selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              Alles
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {CATEGORY_EMOJI[cat] || '📦'} {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries list */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-1">
              {searchQuery ? 'Geen resultaten' : 'Begin je Kluspaspoort'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              {searchQuery
                ? 'Probeer een andere zoekterm.'
                : 'Registreer je eerste klus en bouw een waardevol woninglogboek op.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddSheet(true)} className="rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                Eerste klus toevoegen
              </Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredEntries.map((entry, i) => {
              const PerformerIcon = PERFORMER_ICON[entry.performed_by] || User;
              const isExpanded = expandedId === entry.id;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                      {CATEGORY_EMOJI[entry.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{entry.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(entry.date_performed), 'd MMM yyyy', { locale: nl })}
                        {entry.cost !== null && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                            €{entry.cost}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PerformerIcon className="w-4 h-4 text-muted-foreground" />
                      <ChevronRight className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-90'
                      )} />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                          {entry.description && (
                            <p className="text-sm text-foreground">{entry.description}</p>
                          )}

                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline">
                              {entry.performed_by === 'zelf' ? 'Zelf gedaan' :
                                entry.performed_by === 'handyman' ? 'Handyman' : 'Aannemer'}
                              {entry.handyman_name && `: ${entry.handyman_name}`}
                            </Badge>
                            {entry.address && (
                              <Badge variant="outline">📍 {entry.address}</Badge>
                            )}
                          </div>

                          {/* Photos */}
                          {entry.photos && entry.photos.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                              {entry.photos.map((url, j) => (
                                <img
                                  key={j}
                                  src={url}
                                  alt={`Foto ${j + 1}`}
                                  className="w-24 h-24 rounded-xl object-cover shrink-0 border border-border"
                                />
                              ))}
                            </div>
                          )}

                          {entry.notes && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                              <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              {entry.notes}
                            </div>
                          )}

                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Verwijderen
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Add entry sheet */}
      <AddKlusEntrySheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSubmit={handleAddEntry}
        uploadPhoto={uploadPhoto}
      />

      <BottomNav />
    </div>
  );
};

export default KluspaspoortPage;
