import { useState, useEffect } from 'react';
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
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Users,
  User,
  Euro,
  Loader2,
  CheckCircle,
  Info,
  Clock,
  Plus,
  X,
  MapPin,
  Monitor,
  Building,
} from 'lucide-react';

type Step = 'basic' | 'content' | 'instructor' | 'price';

interface Module {
  title: string;
  duration: string;
}

const CreateLessonPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);
  const [instructorData, setInstructorData] = useState<any>(null);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Gevorderd' | 'Expert'>('Beginner');

  // Step 2: Content
  const [lessonType, setLessonType] = useState<'online' | 'physical' | 'hybrid'>('online');
  const [modules, setModules] = useState<Module[]>([{ title: '', duration: '' }]);
  const [durationHours, setDurationHours] = useState('');
  const [extras, setExtras] = useState('');
  const [description, setDescription] = useState('');

  // Step 3: Instructor (pre-filled)
  // Step 4: Price
  const [price, setPrice] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const categories = [
    'Elektriciteit', 'Loodgieter', 'Tuinwerk', 'Schilderen', 
    'Tegels', 'Timmerwerk', 'HVAC', 'Domotica', 'Renovatie', 'Andere'
  ];

  const levels: Array<'Beginner' | 'Gevorderd' | 'Expert'> = ['Beginner', 'Gevorderd', 'Expert'];

  useEffect(() => {
    loadInstructorData();
  }, []);

  const loadInstructorData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/instructor/register');
      return;
    }

    const { data } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      navigate('/instructor/register');
      return;
    }

    setInstructorData(data);
  };

  const addModule = () => {
    setModules([...modules, { title: '', duration: '' }]);
  };

  const removeModule = (index: number) => {
    if (modules.length > 1) {
      setModules(modules.filter((_, i) => i !== index));
    }
  };

  const updateModule = (index: number, field: 'title' | 'duration', value: string) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const handleNext = () => {
    if (step === 'basic') {
      if (!title || !category) {
        toast.error('Vul titel en categorie in');
        return;
      }
      setStep('content');
    } else if (step === 'content') {
      setStep('instructor');
    } else if (step === 'instructor') {
      setStep('price');
    }
  };

  const handleBack = () => {
    if (step === 'content') setStep('basic');
    else if (step === 'instructor') setStep('content');
    else if (step === 'price') setStep('instructor');
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!price && !asDraft) {
      toast.error('Vul een prijs in');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('lessons').insert([{
        instructor_id: instructorData.id,
        title,
        description,
        category,
        target_audience: targetAudience || null,
        level,
        lesson_type: lessonType,
        modules: modules.filter(m => m.title),
        duration_hours: durationHours ? parseInt(durationHours) : null,
        extras: extras || null,
        price: parseFloat(price) || 0,
        status: asDraft ? 'draft' : 'in_review',
      }]);

      if (error) throw error;

      toast.success(asDraft ? 'Les opgeslagen als concept' : 'Les ingediend voor review');
      navigate('/instructor/dashboard');
    } catch (error) {
      console.error('Create lesson error:', error);
      toast.error('Kon les niet aanmaken');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['basic', 'content', 'instructor', 'price'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header title="Nieuwe Les" showBack />

      <div className="px-4 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {['Basis', 'Inhoud', 'Lesgever', 'Prijs'].map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                index <= currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index < currentStepIndex ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs ${index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground mb-1">
                  Basisinformatie
                </h2>
                <p className="text-sm text-muted-foreground">
                  Beschrijf je les in enkele woorden
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
                <div>
                  <Label htmlFor="title">Titel van de les *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="bijv. Elektriciteit Basis tot Expert"
                    className="rounded-xl mt-1"
                  />
                </div>

                <div>
                  <Label>Categorie *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={category === cat ? 'default' : 'outline'}
                        className="cursor-pointer py-2 px-3"
                        onClick={() => setCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="audience">Doelgroep</Label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="audience"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="bijv. Beginners, hobbyisten, professionals"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label>Niveau</Label>
                  <div className="flex gap-2 mt-2">
                    {levels.map((lvl) => (
                      <Badge
                        key={lvl}
                        variant={level === lvl ? 'default' : 'outline'}
                        className={`cursor-pointer py-2 px-4 flex-1 justify-center ${
                          level === lvl ? '' : ''
                        }`}
                        onClick={() => setLevel(lvl)}
                      >
                        {lvl}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent"
              >
                Volgende
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Content */}
          {step === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Info className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground mb-1">
                  Inhoud & Opbouw
                </h2>
                <p className="text-sm text-muted-foreground">
                  Beschrijf wat deelnemers zullen leren
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
                <div>
                  <Label>Type les</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() => setLessonType('online')}
                      className={`p-3 rounded-xl border text-center transition-colors ${
                        lessonType === 'online' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <Monitor className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <span className="text-xs">Online</span>
                    </button>
                    <button
                      onClick={() => setLessonType('physical')}
                      className={`p-3 rounded-xl border text-center transition-colors ${
                        lessonType === 'physical' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <span className="text-xs">Fysiek</span>
                    </button>
                    <button
                      onClick={() => setLessonType('hybrid')}
                      className={`p-3 rounded-xl border text-center transition-colors ${
                        lessonType === 'hybrid' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <span className="text-xs">Hybride</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Geef een uitgebreide beschrijving van je les..."
                    className="rounded-xl mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Modules</Label>
                    <Button variant="ghost" size="sm" onClick={addModule}>
                      <Plus className="w-4 h-4 mr-1" />
                      Module
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {modules.map((module, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={module.title}
                          onChange={(e) => updateModule(index, 'title', e.target.value)}
                          placeholder={`Module ${index + 1} titel`}
                          className="rounded-xl flex-1"
                        />
                        <Input
                          value={module.duration}
                          onChange={(e) => updateModule(index, 'duration', e.target.value)}
                          placeholder="Duur"
                          className="rounded-xl w-20"
                        />
                        {modules.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeModule(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Totale duur (uren)</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      placeholder="bijv. 8"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="extras">Extra's (optioneel)</Label>
                  <Textarea
                    id="extras"
                    value={extras}
                    onChange={(e) => setExtras(e.target.value)}
                    placeholder="bijv. Materialen inbegrepen, certificaat, ..."
                    className="rounded-xl mt-1"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Terug
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent"
                >
                  Volgende
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Instructor */}
          {step === 'instructor' && (
            <motion.div
              key="instructor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-success" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground mb-1">
                  Lesgever Informatie
                </h2>
                <p className="text-sm text-muted-foreground">
                  Je profiel wordt automatisch gekoppeld
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{instructorData?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{instructorData?.email}</p>
                  </div>
                </div>

                {instructorData?.bio && (
                  <p className="text-sm text-muted-foreground mb-4">{instructorData.bio}</p>
                )}

                {instructorData?.expertise && instructorData.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {instructorData.expertise.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}

                {instructorData?.years_experience > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {instructorData.years_experience} jaar ervaring
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${instructorData?.diploma_verified ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className={instructorData?.diploma_verified ? 'text-success' : 'text-muted-foreground'}>
                      {instructorData?.diploma_verified ? 'Diploma geverifieerd' : 'Diploma in afwachting'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Terug
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent"
                >
                  Volgende
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Price */}
          {step === 'price' && (
            <motion.div
              key="price"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Euro className="w-7 h-7 text-success" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground mb-1">
                  Prijs & Publicatie
                </h2>
                <p className="text-sm text-muted-foreground">
                  Stel je prijs in en publiceer je les
                </p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
                <div>
                  <Label htmlFor="price">Prijs (€)</Label>
                  <div className="relative mt-1">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="149"
                      className="pl-10 rounded-xl text-xl font-bold"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-secondary/50 rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-3">Samenvatting</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titel</span>
                      <span className="font-medium">{title || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categorie</span>
                      <span className="font-medium">{category || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Niveau</span>
                      <span className="font-medium">{level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{lessonType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modules</span>
                      <span className="font-medium">{modules.filter(m => m.title).length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Terug
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={loading || !price}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Publiceren
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="w-full h-12 rounded-xl"
                >
                  Opslaan als concept
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateLessonPage;
