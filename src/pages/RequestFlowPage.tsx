import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  Droplets,
  Hammer,
  Leaf,
  MapPin,
  MessageCircle,
  Paintbrush,
  Plug,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { HandyDetailModal } from '@/components/HandyDetailModal';
import { HammerRating } from '@/components/HammerRating';
import { mockHandyProfiles } from '@/data/mockData';
import { HandyProfile } from '@/types/handymatch';
import { toast } from 'sonner';

const categories = [
  { id: 'elektriciteit', label: 'Elektriciteit', icon: Plug, keywords: ['elektricien', 'elektriciteit', 'lampen', 'stopcontacten', 'domotica'] },
  { id: 'sanitair', label: 'Water & sanitair', icon: Droplets, keywords: ['loodgieter', 'sanitair', 'lekken', 'verwarming'] },
  { id: 'tegels', label: 'Tegels & vloeren', icon: Hammer, keywords: ['tegels', 'badkamer', 'keuken', 'vloer'] },
  { id: 'hout', label: 'Hout & meubels', icon: Wrench, keywords: ['schrijnwerk', 'hout', 'meubels', 'deuren'] },
  { id: 'schilderen', label: 'Schilderen', icon: Paintbrush, keywords: ['schilder', 'behangen', 'verf'] },
  { id: 'tuin', label: 'Tuin & buiten', icon: Leaf, keywords: ['tuinwerk', 'grasmaaien', 'hagen', 'tuin'] },
];

const timings = [
  { id: 'vandaag', label: 'Vandaag nog', hint: 'Zo snel mogelijk' },
  { id: 'morgen', label: 'Morgen', hint: 'Binnen 24 uur' },
  { id: 'deze-week', label: 'Deze week', hint: 'Een dag die past' },
  { id: 'flexibel', label: 'Flexibel', hint: 'Geen haast' },
];

const RequestFlowPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [timing, setTiming] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [contacted, setContacted] = useState<HandyProfile | null>(null);
  const [detailHandy, setDetailHandy] = useState<HandyProfile | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeCategory = categories.find((c) => c.id === category);

  const matches = useMemo(() => {
    if (!activeCategory) return [];
    const scored = mockHandyProfiles.map((h) => {
      const haystack = [h.specialty, ...h.specialties].join(' ').toLowerCase();
      const keywordHits = activeCategory.keywords.filter((k) => haystack.includes(k)).length;
      const availability = timing === 'vandaag' || timing === 'morgen' ? (h.isOnline ? 1 : 0) : 0.5;
      const score = keywordHits * 3 + availability * 2 + h.rating / 2 - h.distance / 10;
      return { handy: h, score, keywordHits };
    });
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.handy);
  }, [activeCategory, timing]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleContact = (handy: HandyProfile) => {
    setContacted(handy);
    toast.success(`Je vraag is naar ${handy.name} gestuurd`);
  };

  const timingLabel = timings.find((t) => t.id === timing)?.label ?? '';

  if (contacted) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="safe-area-top gradient-teal text-white px-4 py-6">
          <h1 className="font-display font-bold text-2xl">Aangevraagd</h1>
        </header>
        <div className="px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-6 shadow-card text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              {contacted.name} is verwittigd
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {activeCategory?.label} • {timingLabel}. Je krijgt meestal binnen een uur antwoord en spreekt
              daarna samen af wanneer jullie het samen aanpakken.
            </p>
            <button
              onClick={() => navigate('/chats')}
              className="w-full py-4 px-6 rounded-2xl btn-cta font-semibold flex items-center justify-center gap-2 mb-3"
            >
              <MessageCircle className="w-5 h-5" />
              Naar het gesprek
            </button>
            <button
              onClick={() => {
                setContacted(null);
                setStep(1);
                setCategory(null);
                setTiming(null);
                setPhoto(null);
              }}
              className="w-full py-3 text-sm text-muted-foreground font-medium"
            >
              Nieuwe hulpvraag
            </button>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="safe-area-top gradient-teal text-white px-4 pt-5 pb-6">
        <div className="flex items-center gap-3 mb-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <p className="text-white/70 text-xs font-medium">Stap {step} van 3</p>
            <h1 className="font-display font-bold text-2xl">
              {step === 1 ? 'Wat is de klus?' : step === 2 ? 'Wanneer past het?' : 'Hulp in de buurt'}
            </h1>
          </div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </header>

      <div className="px-4 py-5">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-3"
            >
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCategory(id);
                    setStep(2);
                  }}
                  className={`p-4 rounded-2xl border bg-card text-left transition-all card-elevated ${
                    category === id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {timings.map(({ id, label, hint }) => (
                <button
                  key={id}
                  onClick={() => setTiming(id)}
                  className={`w-full p-4 rounded-2xl border bg-card flex items-center gap-3 text-left transition-all ${
                    timing === id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                  {timing === id && <CheckCircle className="w-5 h-5 text-primary" />}
                </button>
              ))}

              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="font-semibold text-foreground text-sm mb-1">Eén foto (optioneel)</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Een foto helpt om meteen de juiste hand te vinden.
                </p>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                {photo ? (
                  <div className="relative">
                    <img src={photo} alt="Klus" className="w-full h-40 object-cover rounded-xl" />
                    <button
                      onClick={() => setPhoto(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => cameraRef.current?.click()}
                      className="flex-1 py-3 rounded-xl bg-primary/10 text-primary font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Camera
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium text-sm"
                    >
                      Bestand
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!timing}
                className="w-full py-4 px-6 rounded-2xl btn-cta font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Toon hulp in de buurt
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-accent" />
                {activeCategory?.label} • {timingLabel}
              </div>

              {matches.map((handy, i) => (
                <motion.div
                  key={handy.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-3xl border border-border shadow-card overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={handy.avatar}
                        alt={handy.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground truncate">{handy.name}</h3>
                        <p className="text-sm text-primary font-medium">{handy.specialty}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <HammerRating rating={handy.rating} size="sm" />
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {handy.distance} km
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{handy.description}</p>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                        {handy.experience}
                      </span>
                      {handy.isOnline && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          Nu beschikbaar
                        </span>
                      )}
                      {handy.hourlyRate && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground font-medium">
                          €{handy.hourlyRate}/u
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleContact(handy)}
                        className="flex-1 py-3 rounded-xl btn-cta font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Samen afspreken
                      </button>
                      <button
                        onClick={() => setDetailHandy(handy)}
                        className="px-4 py-3 rounded-xl bg-muted text-foreground font-medium text-sm"
                      >
                        Profiel
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <button
                onClick={() => navigate('/ai')}
                className="w-full p-4 rounded-2xl border border-dashed border-primary/40 text-primary text-sm font-medium"
              >
                Liever eerst zelf proberen? Vraag de AI om hulp
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HandyDetailModal
        handy={detailHandy}
        isOpen={!!detailHandy}
        onClose={() => setDetailHandy(null)}
        onContact={(handy) => {
          setDetailHandy(null);
          handleContact(handy);
        }}
      />

      <BottomNav />
    </div>
  );
};

export default RequestFlowPage;
