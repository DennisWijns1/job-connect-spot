import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Wrench,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Hammer,
  Lightbulb,
  Loader2,
  OctagonAlert,
  Camera,
  Brain,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TutorialStep {
  title: string;
  description: string;
  tip: string | null;
  risk_level: 'GREEN' | 'YELLOW';
  detailed_explanation: string;
}

interface TutorialData {
  tutorial_title: string;
  tutorial_category: string;
  risk_level: 'GREEN' | 'YELLOW' | 'RED';
  estimated_duration: string;
  tools_needed: string[];
  materials_needed: string[];
  steps: TutorialStep[];
  when_to_stop: string;
  disclaimer: string;
}

const TutorialPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as {
    problem: string;
    category: string;
    riskLevel: string;
    userType: string;
  } | null;

  const [tutorialData, setTutorialData] = useState<TutorialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.problem) {
      navigate('/ai');
      return;
    }
    fetchTutorial();
  }, []);

  const fetchTutorial = async () => {
    if (!state) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            userType: state.userType || 'seeker',
            message: state.problem,
            mode: 'tutorial',
            category: state.category,
            riskLevel: state.riskLevel,
            categoryHint: null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.error || 'Tutorial kon niet worden gegenereerd.');
        toast({
          title: 'Fout',
          description: result.error || 'Tutorial generatie mislukt.',
          variant: 'destructive',
        });
      } else {
        setTutorialData(result.tutorial);
      }
    } catch (err) {
      console.error('Tutorial fetch error:', err);
      setError('Verbindingsfout. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const progress = tutorialData
    ? (completedSteps.size / tutorialData.steps.length) * 100
    : 0;

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'GREEN':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'YELLOW':
        return <AlertCircle className="w-4 h-4 text-accent" />;
      case 'RED':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <Header title="Tutorial" showBack />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm">Tutorial wordt gegenereerd...</p>
            <p className="text-muted-foreground text-xs">Dit kan enkele seconden duren</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !tutorialData) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <Header title="Tutorial" showBack />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <OctagonAlert className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-foreground font-medium">{error || 'Er ging iets mis'}</p>
            <Button onClick={fetchTutorial} className="btn-cta">
              Opnieuw proberen
            </Button>
            <Button variant="ghost" onClick={() => navigate('/ai')}>
              Terug naar AI Klushulp
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const allDone = completedSteps.size === tutorialData.steps.length;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Header title="Tutorial" showBack />

      <div className="px-4 py-4 space-y-5">
        {/* Title & Meta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-foreground">{tutorialData.tutorial_title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">{tutorialData.tutorial_category}</span>
            <span className="text-xs text-muted-foreground">⏱ {tutorialData.estimated_duration}</span>
            <span className="inline-flex items-center gap-1">
              {getRiskIcon(tutorialData.risk_level)}
              <span className="text-xs text-muted-foreground">
                {tutorialData.risk_level === 'GREEN' ? 'Veilig' : tutorialData.risk_level === 'YELLOW' ? 'Voorzichtig' : 'Gevaarlijk'}
              </span>
            </span>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedSteps.size} van {tutorialData.steps.length} stappen</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Tools & Materials */}
        {(tutorialData.tools_needed.length > 0 || tutorialData.materials_needed.length > 0) && (
          <Accordion type="single" collapsible>
            <AccordionItem value="tools" className="border rounded-xl px-3 bg-card">
              <AccordionTrigger className="text-sm font-semibold py-3">
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Gereedschap & Materialen
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  {tutorialData.tools_needed.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Gereedschap</h5>
                      <ul className="space-y-1">
                        {tutorialData.tools_needed.map((tool, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <Wrench className="w-3 h-3 text-muted-foreground" />
                            {tool}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tutorialData.materials_needed.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Materialen</h5>
                      <ul className="space-y-1">
                        {tutorialData.materials_needed.map((mat, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <Package className="w-3 h-3 text-muted-foreground" />
                            {mat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {tutorialData.steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isActive = activeStep === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border p-4 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : isCompleted
                    ? 'border-success/30 bg-success/5'
                    : 'border-border bg-card'
                }`}
                onClick={() => setActiveStep(index)}
              >
                {/* Step header */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleStep(index)}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <span
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold ${
                        isCompleted
                          ? 'bg-success text-success-foreground'
                          : isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {step.title}
                      </h3>
                      {step.risk_level === 'YELLOW' && (
                        <AlertCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>

                {/* Tip */}
                {step.tip && (
                  <div className="mt-3 ml-11 bg-accent/10 border border-accent/20 rounded-lg p-2.5">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground">{step.tip}</p>
                    </div>
                  </div>
                )}

                {/* Meer weten accordion */}
                <div className="mt-2 ml-11">
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`detail-${index}`} className="border-0">
                      <AccordionTrigger className="text-xs text-primary font-medium py-1 hover:no-underline">
                        Meer weten?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-foreground leading-relaxed">
                          {step.detailed_explanation}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* When to stop */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <OctagonAlert className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-destructive uppercase mb-1">Wanneer stoppen</h4>
              <p className="text-sm text-destructive/80">{tutorialData.when_to_stop}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Vorige
          </Button>
          <Button
            className="flex-1 btn-forest"
            disabled={activeStep === tutorialData.steps.length - 1}
            onClick={() => setActiveStep((s) => Math.min(tutorialData!.steps.length - 1, s + 1))}
          >
            Volgende
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Interactive & AR CTAs */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-primary/30 text-primary"
            onClick={() => navigate('/interactive-tutorial', {
              state: {
                problem: state?.problem,
                category: state?.category,
                riskLevel: state?.riskLevel,
                userType: state?.userType,
              }
            })}
          >
            <Brain className="w-4 h-4 mr-2" />
            Interactief oefenen
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-primary/30 text-primary"
            onClick={() => navigate('/ar-tutorial', {
              state: {
                problem: state?.problem,
                category: state?.category,
                riskLevel: state?.riskLevel,
                userType: state?.userType,
                tutorialData,
              }
            })}
          >
            <Camera className="w-4 h-4 mr-2" />
            AR-weergave
          </Button>
        </div>

        {/* Completion / Escalation */}
        {allDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success/30 rounded-xl p-4 text-center space-y-3"
          >
            <CheckCircle className="w-8 h-8 text-success mx-auto" />
            <h3 className="font-semibold text-foreground">Alle stappen voltooid!</h3>
            <p className="text-sm text-muted-foreground">Gefeliciteerd! Heb je nog hulp nodig?</p>
            <Button className="btn-cta w-full" onClick={() => navigate('/ai')}>
              Terug naar AI Klushulp
            </Button>
          </motion.div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-4 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Lukt het niet? Geen probleem.</p>
            <Button
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => navigate('/swipe')}
            >
              <Hammer className="w-4 h-4 mr-2" />
              Schakel een Handy in
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">{tutorialData.disclaimer}</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default TutorialPage;
