import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Hammer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const HANDY_SPECIALTIES = [
  'Elektriciteit', 'Loodgieterij', 'Schilderwerk', 'Timmerwerk',
  'Tegelwerk', 'Vloerwerk', 'Dakwerk', 'Isolatie',
  'Tuinaanleg', 'Verwarming', 'Airconditioning', 'Beveiliging',
  'Domotica', 'Metselwerk', 'Gipswerk', 'Raamwerk',
];

const SEEKER_TYPES = [
  'Kleine herstellingen', 'Verbouwing', 'Tuinwerk',
  'Schilderwerk', 'Sanitair', 'Elektriciteit',
  'Vloerwerk', 'Overige klussen',
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const userType = profile?.user_type || localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  const totalSteps = isHandy ? 4 : 3;
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1 data
  const [fullName, setFullName] = useState(profile?.full_name || '');

  // Step 2 data
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  // Step 3 handy data
  const [isQuoteBased, setIsQuoteBased] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleJobType = (j: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j]
    );
  };

  const saveStep = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      if (step === 1) {
        if (!fullName.trim()) {
          toast.error('Voer je naam in');
          return;
        }
        await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('user_id', user.id);

      } else if (step === 2 && isHandy) {
        if (selectedSpecialties.length === 0) {
          toast.error('Kies minstens één specialisatie');
          return;
        }
        await supabase.from('profiles').update({ specialty: selectedSpecialties.join(', ') }).eq('user_id', user.id);

      } else if (step === 2 && !isHandy) {
        // Seekers: save preferred job types in bio or specialties
        await supabase.from('profiles').update({
          bio: selectedJobTypes.length > 0 ? `Gezocht: ${selectedJobTypes.join(', ')}` : null,
        }).eq('user_id', user.id);

      } else if (step === 3 && isHandy) {
        const rate = parseFloat(hourlyRate);
        if (!isQuoteBased && (!hourlyRate || isNaN(rate) || rate <= 0)) {
          toast.error('Voer een geldig uurtarief in');
          return;
        }
        await supabase.from('profiles').update({
          hourly_rate: isQuoteBased ? null : rate,
        } as any).eq('user_id', user.id);
      }

      // Last step: mark onboarding complete
      const isLastStep = step === totalSteps - 1;
      if (isLastStep) {
        await (supabase.from('profiles').update({ onboarding_completed: true } as any) as any).eq('user_id', user.id);
        await refreshProfile();
        setStep((prev) => prev + 1);
      } else if (step < totalSteps) {
        setStep((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error saving onboarding step:', err);
      toast.error('Er ging iets mis. Probeer opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    navigate('/swipe');
  };

  // Welcome/done screen
  if (step === totalSteps) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Hammer className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-3">
            Welkom bij HandyMatch!
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
            {isHandy
              ? 'Je profiel is klaar. Begin met swipen op projecten en maak je eerste klus!'
              : 'Je account is ingesteld. Vind de perfecte Handy voor jouw klus!'}
          </p>
          <button
            onClick={handleFinish}
            className="w-full py-4 px-6 rounded-2xl btn-cta font-semibold text-lg flex items-center justify-center gap-3"
          >
            Beginnen
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">Stap {step} van {totalSteps - 1}</span>
          <span className="text-sm text-primary font-semibold">{Math.round((step / (totalSteps - 1)) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="flex-1 px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: Naam */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
            >
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Hoe mogen we je noemen?
              </h1>
              <p className="text-muted-foreground mb-8">
                Jouw naam is zichtbaar voor {isHandy ? 'klanten' : "Handy's"}.
              </p>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Volledige naam"
                className="h-14 rounded-xl text-lg"
                autoFocus
              />
            </motion.div>
          )}

          {/* STEP 2 HANDY: Specialisaties */}
          {step === 2 && isHandy && (
            <motion.div
              key="step2handy"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
            >
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Wat zijn jouw specialisaties?
              </h1>
              <p className="text-muted-foreground mb-6">
                Kies alle vakgebieden waarin je actief bent.
              </p>
              <div className="flex flex-wrap gap-2">
                {HANDY_SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSpecialty(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedSpecialties.includes(s)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {selectedSpecialties.includes(s) && <Check className="w-3 h-3 inline mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 SEEKER: Klus types */}
          {step === 2 && !isHandy && (
            <motion.div
              key="step2seeker"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
            >
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Wat voor klussen heb je?
              </h1>
              <p className="text-muted-foreground mb-6">
                Selecteer de soorten werk die je nodig hebt.
              </p>
              <div className="flex flex-wrap gap-2">
                {SEEKER_TYPES.map((j) => (
                  <button
                    key={j}
                    onClick={() => toggleJobType(j)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedJobTypes.includes(j)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {selectedJobTypes.includes(j) && <Check className="w-3 h-3 inline mr-1" />}
                    {j}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 HANDY: Uurtarief */}
          {step === 3 && isHandy && (
            <motion.div
              key="step3handy"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
            >
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Hoe reken jij af?
              </h1>
              <p className="text-muted-foreground mb-6">
                Klanten zien dit op jouw profiel.
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setIsQuoteBased(false)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    !isQuoteBased ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <p className="font-semibold text-foreground">Uurtarief</p>
                  <p className="text-sm text-muted-foreground">Je werkt aan een vast uurtarief</p>
                </button>
                <button
                  onClick={() => setIsQuoteBased(true)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isQuoteBased ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <p className="font-semibold text-foreground">Op offerte</p>
                  <p className="text-sm text-muted-foreground">Je maakt een offerte per klus</p>
                </button>
              </div>

              {!isQuoteBased && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Uurtarief (EUR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
                    <Input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="45"
                      className="pl-8 h-14 rounded-xl text-lg"
                      min="1"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="p-6 safe-area-bottom">
        <button
          onClick={saveStep}
          disabled={isSaving}
          className="w-full py-4 px-6 rounded-2xl btn-cta font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              {step === totalSteps - 1 ? 'Voltooien' : 'Volgende'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
