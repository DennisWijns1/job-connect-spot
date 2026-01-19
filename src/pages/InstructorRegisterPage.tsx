import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Building,
  ChevronRight,
  ChevronLeft,
  Upload,
  Camera,
  CheckCircle,
  Loader2,
  Award,
  FileCheck,
  AlertTriangle,
  X,
} from 'lucide-react';

type Step = 'info' | 'diploma' | 'verifying' | 'complete';

interface VerificationResult {
  isValid: boolean;
  overallScore: number;
  recommendation: string;
  summary: string;
  factors?: {
    diplomaNumber?: { found: boolean; confidence: number; notes: string };
    signatures?: { found: boolean; confidence: number; notes: string };
    stamp?: { found: boolean; confidence: number; notes: string };
    institution?: { found: boolean; confidence: number; notes: string };
    trainingTitle?: { found: boolean; confidence: number; notes: string };
    datePlace?: { found: boolean; confidence: number; notes: string };
  };
}

const InstructorRegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  
  // Diploma upload
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [diplomaPreview, setDiplomaPreview] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [instructorId, setInstructorId] = useState<string | null>(null);

  const expertiseOptions = [
    'Elektriciteit', 'Loodgieter', 'Tuinwerk', 'Schilderen', 
    'Tegels', 'Timmerwerk', 'HVAC', 'Domotica', 'Renovatie'
  ];

  const toggleExpertise = (skill: string) => {
    setExpertise(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleDiplomaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDiplomaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiplomaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInfoSubmit = async () => {
    if (!fullName || !email || !password || !phone) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'instructor'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Geen gebruiker aangemaakt');

      // Create instructor profile
      const { data: instructorData, error: instructorError } = await supabase
        .from('instructors')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          email,
          phone,
          vat_number: vatNumber || null,
          bio: bio || null,
          expertise: expertise.length > 0 ? expertise : null,
          years_experience: yearsExperience ? parseInt(yearsExperience) : 0,
        })
        .select()
        .single();

      if (instructorError) throw instructorError;

      setInstructorId(instructorData.id);
      
      // Also create a profile in the profiles table
      await supabase.from('profiles').insert({
        user_id: authData.user.id,
        full_name: fullName,
        user_type: 'instructor',
      });

      localStorage.setItem('handymatch_userType', 'instructor');
      
      setStep('diploma');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registratie mislukt');
    } finally {
      setLoading(false);
    }
  };

  const handleDiplomaSubmit = async () => {
    if (!diplomaFile || !instructorId) {
      toast.error('Upload een diploma om verder te gaan');
      return;
    }

    setStep('verifying');
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Niet ingelogd');

      // Upload diploma to storage
      const fileName = `${user.id}/${Date.now()}-${diplomaFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('instructor-diplomas')
        .upload(fileName, diplomaFile);

      if (uploadError) throw uploadError;

      // Get public URL (or signed URL for private bucket)
      const { data: urlData } = await supabase.storage
        .from('instructor-diplomas')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (!urlData?.signedUrl) throw new Error('Kon URL niet ophalen');

      // Create diploma record
      const { data: diplomaData, error: diplomaError } = await supabase
        .from('instructor_diplomas')
        .insert({
          instructor_id: instructorId,
          diploma_image_url: urlData.signedUrl,
        })
        .select()
        .single();

      if (diplomaError) throw diplomaError;

      // Call verification edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-diploma', {
        body: {
          diplomaImageUrl: urlData.signedUrl,
          diplomaId: diplomaData.id,
        }
      });

      if (verifyError) throw verifyError;

      setVerificationResult(verifyData.result);
      setStep('complete');
    } catch (error) {
      console.error('Diploma verification error:', error);
      toast.error('Verificatie mislukt. Probeer opnieuw.');
      setStep('diploma');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationIcon = (found: boolean) => {
    return found ? (
      <CheckCircle className="w-4 h-4 text-success" />
    ) : (
      <X className="w-4 h-4 text-destructive" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Lesgever Registratie" showBack />

      <div className="px-4 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['info', 'diploma', 'complete'].map((s, index) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s || (step === 'verifying' && s === 'diploma') 
                  ? 'bg-primary text-primary-foreground'
                  : ['complete'].includes(step) && index < 2
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-1 ${
                  (['diploma', 'verifying', 'complete'].includes(step) && index === 0) ||
                  (step === 'complete' && index === 1)
                    ? 'bg-success'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                  Word Lesgever
                </h2>
                <p className="text-muted-foreground">
                  Vul je gegevens in om je te registreren als lesgever
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
                <div>
                  <Label htmlFor="fullName">Volledige naam *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jan Janssens"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-mailadres *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jan@voorbeeld.be"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Wachtwoord *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimaal 6 karakters"
                    className="rounded-xl mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefoonnummer *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+32 123 456 789"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vatNumber">BTW-nummer (optioneel)</Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="vatNumber"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder="BE0123456789"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio (optioneel)</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Vertel iets over jezelf en je expertise..."
                    className="rounded-xl mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Jaren ervaring</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder="5"
                    className="rounded-xl mt-1"
                  />
                </div>

                <div>
                  <Label>Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expertiseOptions.map((skill) => (
                      <Badge
                        key={skill}
                        variant={expertise.includes(skill) ? 'default' : 'outline'}
                        className="cursor-pointer py-2 px-3"
                        onClick={() => toggleExpertise(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleInfoSubmit}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Volgende stap
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Diploma Upload */}
          {step === 'diploma' && (
            <motion.div
              key="diploma"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                  Upload je Diploma
                </h2>
                <p className="text-muted-foreground">
                  Upload een duidelijke foto van je diploma of certificaat voor verificatie
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border">
                <div className="bg-secondary/50 rounded-xl p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    AI Verificatie controleert:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Diplomanummer</li>
                    <li>✓ Handtekening(en)</li>
                    <li>✓ Stempel / zegel</li>
                    <li>✓ Officiële instelling</li>
                    <li>✓ Correcte opleidingstitel</li>
                    <li>✓ Datum & plaats</li>
                  </ul>
                </div>

                {diplomaPreview ? (
                  <div className="relative">
                    <img 
                      src={diplomaPreview} 
                      alt="Diploma preview" 
                      className="w-full rounded-xl object-contain max-h-64"
                    />
                    <button
                      onClick={() => {
                        setDiplomaFile(null);
                        setDiplomaPreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <span className="text-sm text-muted-foreground">Klik om te uploaden</span>
                    <span className="text-xs text-muted-foreground mt-1">JPG, PNG of PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDiplomaUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('info')}
                  className="flex-1 h-12 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Terug
                </Button>
                <Button
                  onClick={handleDiplomaSubmit}
                  disabled={!diplomaFile || loading}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent"
                >
                  Verifiëren
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Verifying */}
          {step === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                Diploma wordt geverifieerd
              </h2>
              <p className="text-muted-foreground">
                Onze AI analyseert je diploma op echtheid en geldigheid...
              </p>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  verificationResult?.recommendation === 'verified' 
                    ? 'bg-success/20' 
                    : verificationResult?.recommendation === 'rejected'
                      ? 'bg-destructive/20'
                      : 'bg-accent/20'
                }`}>
                  {verificationResult?.recommendation === 'verified' ? (
                    <CheckCircle className="w-10 h-10 text-success" />
                  ) : verificationResult?.recommendation === 'rejected' ? (
                    <X className="w-10 h-10 text-destructive" />
                  ) : (
                    <AlertTriangle className="w-10 h-10 text-accent" />
                  )}
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                  {verificationResult?.recommendation === 'verified' 
                    ? 'Diploma Geverifieerd!'
                    : verificationResult?.recommendation === 'rejected'
                      ? 'Verificatie Afgewezen'
                      : 'Handmatige Review Nodig'
                  }
                </h2>
                <p className="text-muted-foreground">
                  {verificationResult?.summary}
                </p>
              </div>

              {/* Verification Details */}
              {verificationResult?.factors && (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <h4 className="font-semibold text-foreground mb-4">Verificatie Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Diplomanummer</span>
                      {getVerificationIcon(verificationResult.factors.diplomaNumber?.found ?? false)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Handtekening(en)</span>
                      {getVerificationIcon(verificationResult.factors.signatures?.found ?? false)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stempel/Zegel</span>
                      {getVerificationIcon(verificationResult.factors.stamp?.found ?? false)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Officiële instelling</span>
                      {getVerificationIcon(verificationResult.factors.institution?.found ?? false)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Opleidingstitel</span>
                      {getVerificationIcon(verificationResult.factors.trainingTitle?.found ?? false)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Datum & Plaats</span>
                      {getVerificationIcon(verificationResult.factors.datePlace?.found ?? false)}
                    </div>
                  </div>

                  {verificationResult.overallScore !== undefined && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Totale Score</span>
                        <span className="font-bold text-lg">{verificationResult.overallScore}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            verificationResult.overallScore >= 70 
                              ? 'bg-success' 
                              : verificationResult.overallScore >= 40 
                                ? 'bg-accent' 
                                : 'bg-destructive'
                          }`}
                          style={{ width: `${verificationResult.overallScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => navigate('/instructor/dashboard')}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg"
              >
                Naar Dashboard
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstructorRegisterPage;
