import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Mail, Lock, User, ArrowRight, Eye, EyeOff, Upload, Check, HelpCircle, Wrench, Zap, Droplets, Paintbrush, Ruler, Trees, Shield, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const specializations = [
  { id: 'loodgieter', label: 'Loodgieter', icon: Droplets },
  { id: 'elektricien', label: 'Elektricien', icon: Zap },
  { id: 'schilder', label: 'Schilder', icon: Paintbrush },
  { id: 'timmerman', label: 'Timmerman', icon: Ruler },
  { id: 'tuinier', label: 'Tuinier', icon: Trees },
  { id: 'metselaar', label: 'Metselaar', icon: Hammer },
  { id: 'dakdekker', label: 'Dakdekker', icon: Shield },
  { id: 'algemeen', label: 'Algemene klussen', icon: Wrench },
];

const HandyRegisterPage = () => {
  const navigate = useNavigate();
  const { user: loggedInUser, switchRole, refreshProfile } = useAuth();
  const isUpgrade = !!loggedInUser;
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userRole: '' as 'helper' | 'handy' | 'both' | '',
    hasDiploma: false,
    diplomaFile: null as File | null,
    diplomaUploaded: false,
    mainSpecialization: '',
    additionalSpecializations: [] as string[],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, diplomaFile: file, diplomaUploaded: true });
      toast.success('Diploma geüpload!', {
        description: 'AI analyseert nu je diploma...',
      });
      
      // Simulate AI analysis
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          mainSpecialization: 'elektricien',
        }));
        toast.success('Specialisatie gedetecteerd: Elektricien', {
          description: 'Je kunt dit aanpassen indien nodig',
        });
      }, 2000);
    }
  };

  const toggleAdditionalSpec = (specId: string) => {
    setFormData(prev => ({
      ...prev,
      additionalSpecializations: prev.additionalSpecializations.includes(specId)
        ? prev.additionalSpecializations.filter(s => s !== specId)
        : [...prev.additionalSpecializations, specId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.userRole) {
      toast.error('Kies je rol: Helper, Handy of beide');
      return;
    }

    if (isUpgrade && loggedInUser) {
      // Upgrade existing account to also be Handy
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('profiles').update({
        is_handy: true,
        user_type: 'both',
        specialty: formData.mainSpecialization || null,
      }).eq('user_id', loggedInUser.id);

      await refreshProfile();
      switchRole('handy');
      toast.success('Je bent nu ook actief als Handy!');
      navigate('/profile');
      return;
    }

    // New registration
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    localStorage.setItem('handymatch_userType', 'handy');
    localStorage.setItem('handymatch_user', JSON.stringify({
      email: formData.email,
      username: `${formData.firstName} ${formData.lastName}`,
      role: formData.userRole,
      specialization: formData.mainSpecialization,
      hasDiploma: formData.hasDiploma,
      diplomaVerified: formData.diplomaUploaded,
    }));

    toast.success('Account aangemaakt!');
    navigate('/swipe');
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error('Vul alle velden in');
        return;
      }
    }
    if (step === 2) {
      if (!formData.userRole) {
        toast.error('Kies je rol');
        return;
      }
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Hammer className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Handy<span className="text-accent">Match</span>
          </span>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Registreren als Handy
              </h1>
              <p className="text-muted-foreground mb-6">
                Vul je basisgegevens in
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Voornaam"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-12 h-14 rounded-xl border-border bg-card"
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder="Achternaam"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-14 rounded-xl border-border bg-card"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="E-mailadres"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-14 rounded-xl border-border bg-card"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Wachtwoord"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 pr-12 h-14 rounded-xl border-border bg-card"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Role Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Wat wil je doen?
              </h1>
              <p className="text-muted-foreground mb-6">
                Kies je rol op HandyMatch
              </p>

              <div className="space-y-3">
                {/* Helper Option */}
                <button
                  onClick={() => setFormData({ ...formData, userRole: formData.userRole === 'helper' ? '' : 'helper' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.userRole === 'helper' || formData.userRole === 'both'
                      ? 'border-accent bg-secondary'
                      : 'border-border bg-card hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.userRole === 'helper' || formData.userRole === 'both'
                        ? 'border-accent bg-accent'
                        : 'border-muted-foreground'
                    }`}>
                      {(formData.userRole === 'helper' || formData.userRole === 'both') && (
                        <Check className="w-4 h-4 text-accent-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Ik wil helpen</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Als Helper help je mensen met eenvoudige klussen zoals tuinwerk, verhuizen, schoonmaken, of kleine reparaties. Geen diploma of specialisatie vereist.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Help met eenvoudige taken: terras aanleggen, gras maaien, verhuizen...
                      </p>
                    </div>
                  </div>
                </button>

                {/* Handy Option */}
                <button
                  onClick={() => setFormData({ ...formData, userRole: formData.userRole === 'handy' ? '' : 'handy' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.userRole === 'handy' || formData.userRole === 'both'
                      ? 'border-accent bg-secondary'
                      : 'border-border bg-card hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.userRole === 'handy' || formData.userRole === 'both'
                        ? 'border-accent bg-accent'
                        : 'border-muted-foreground'
                    }`}>
                      {(formData.userRole === 'handy' || formData.userRole === 'both') && (
                        <Check className="w-4 h-4 text-accent-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Ik ben een Handy</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Als Handy ben je een vakman/vrouw met specifieke expertise. Je kunt je diploma uploaden voor verificatie en krijgt toegang tot professionele klussen.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Professionele vakman met specialisatie en expertise
                      </p>
                    </div>
                  </div>
                </button>

                {/* Both Option */}
                <button
                  onClick={() => setFormData({ ...formData, userRole: formData.userRole === 'both' ? '' : 'both' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.userRole === 'both'
                      ? 'border-accent bg-secondary'
                      : 'border-border bg-card hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.userRole === 'both'
                        ? 'border-accent bg-accent'
                        : 'border-muted-foreground'
                    }`}>
                      {formData.userRole === 'both' && (
                        <Check className="w-4 h-4 text-accent-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Beide</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ik wil zowel helpen als professionele klussen aannemen
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Diploma & Specialization */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto"
            >
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Specialisatie & Diploma
              </h1>
              <p className="text-muted-foreground mb-6">
                Vertel ons meer over je expertise
              </p>

              {(formData.userRole === 'handy' || formData.userRole === 'both') && (
                <>
                  {/* Diploma Question */}
                  <div className="mb-6">
                    <label className="font-semibold text-foreground block mb-3">
                      Ben je een gediplomeerde vakman?
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({ ...formData, hasDiploma: true })}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                          formData.hasDiploma
                            ? 'border-accent bg-secondary text-accent'
                            : 'border-border bg-card'
                        }`}
                      >
                        Ja
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, hasDiploma: false, diplomaFile: null, diplomaUploaded: false })}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                          !formData.hasDiploma
                            ? 'border-accent bg-secondary text-accent'
                            : 'border-border bg-card'
                        }`}
                      >
                        Nee
                      </button>
                    </div>
                  </div>

                  {/* Diploma Upload */}
                  {formData.hasDiploma && (
                    <div className="mb-6">
                      <label className="font-semibold text-foreground block mb-3">
                        Upload je diploma (optioneel)
                      </label>
                      {!formData.diplomaUploaded ? (
                        <label className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border bg-card cursor-pointer hover:border-accent/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground text-center">
                            Sleep je diploma hierheen of klik om te uploaden
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
                          <Check className="w-5 h-5 text-success" />
                          <span className="text-sm font-medium text-foreground flex-1">
                            {formData.diplomaFile?.name}
                          </span>
                          <button
                            onClick={() => setFormData({ ...formData, diplomaFile: null, diplomaUploaded: false })}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {formData.hasDiploma && !formData.diplomaUploaded && (
                        <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          Zonder diploma-upload is verificatie niet mogelijk
                        </p>
                      )}
                    </div>
                  )}

                  {/* Main Specialization */}
                  <div className="mb-6">
                    <label className="font-semibold text-foreground block mb-3">
                      Wat is je hoofdspecialisatie?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {specializations.map((spec) => (
                        <button
                          key={spec.id}
                          onClick={() => setFormData({ ...formData, mainSpecialization: spec.id })}
                          className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                            formData.mainSpecialization === spec.id
                              ? 'border-accent bg-secondary'
                              : 'border-border bg-card hover:border-accent/50'
                          }`}
                        >
                          <spec.icon className={`w-5 h-5 ${
                            formData.mainSpecialization === spec.id ? 'text-accent' : 'text-muted-foreground'
                          }`} />
                          <span className="text-sm font-medium">{spec.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Additional Specializations */}
              <div className="mb-6">
                <label className="font-semibold text-foreground block mb-3">
                  {formData.userRole === 'helper' 
                    ? 'Waarmee wil je helpen?' 
                    : 'Kom je ook in aanmerking voor andere klussen?'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => toggleAdditionalSpec(spec.id)}
                      disabled={spec.id === formData.mainSpecialization}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.additionalSpecializations.includes(spec.id)
                          ? 'bg-accent text-accent-foreground'
                          : spec.id === formData.mainSpecialization
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-card border border-border hover:border-accent/50'
                      }`}
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 safe-area-bottom space-y-4"
      >
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="flex-1 h-14 rounded-xl"
            >
              Terug
            </Button>
          )}
          <Button
            onClick={step === 3 ? handleSubmit : nextStep}
            className="flex-1 h-14 rounded-xl btn-cta"
          >
            {step === 3 ? 'Account aanmaken' : 'Volgende'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <p className="text-center text-muted-foreground">
          Al een account?{' '}
          <button
            onClick={() => navigate('/login', { state: { userType: 'handy' } })}
            className="text-accent font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default HandyRegisterPage;
