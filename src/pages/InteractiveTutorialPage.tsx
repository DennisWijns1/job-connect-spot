import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizComponent, type QuizQuestion } from '@/components/interactive/QuizComponent';
import { DragDropComponent, type DragDropExercise } from '@/components/interactive/DragDropComponent';
import { StepSimulationComponent, type SimulationStep } from '@/components/interactive/StepSimulationComponent';
import { Loader2, OctagonAlert, Brain, GripVertical, ListChecks, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InteractiveData {
  quiz: QuizQuestion[];
  drag_drop: DragDropExercise[];
  simulation: {
    title: string;
    steps: SimulationStep[];
  };
}

const InteractiveTutorialPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as {
    problem: string;
    category: string;
    riskLevel: string;
    userType: string;
  } | null;

  const [data, setData] = useState<InteractiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!state?.problem) {
      navigate('/ai');
      return;
    }
    fetchInteractiveContent();
  }, []);

  const fetchInteractiveContent = async () => {
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
            mode: 'interactive',
            category: state.category,
            riskLevel: state.riskLevel,
            categoryHint: null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.error || 'Interactieve content kon niet worden gegenereerd.');
        toast({
          title: 'Fout',
          description: result.error || 'Generatie mislukt.',
          variant: 'destructive',
        });
      } else {
        setData(result.interactive);
      }
    } catch (err) {
      console.error('Interactive content fetch error:', err);
      setError('Verbindingsfout. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionComplete = (section: string) => (score: number, total: number) => {
    setCompletedSections((prev) => new Set(prev).add(section));
    toast({
      title: section === 'quiz' ? 'Quiz voltooid!' : section === 'dragdrop' ? 'Oefening voltooid!' : 'Simulatie voltooid!',
      description: `Score: ${score}/${total}`,
    });
  };

  const allCompleted = completedSections.size === 3;
  const progressPct = (completedSections.size / 3) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <Header title="Interactief leren" showBack />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm">Interactieve oefeningen worden gegenereerd...</p>
            <p className="text-muted-foreground text-xs">Dit kan enkele seconden duren</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <Header title="Interactief leren" showBack />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <OctagonAlert className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-foreground font-medium">{error || 'Er ging iets mis'}</p>
            <Button onClick={fetchInteractiveContent} className="btn-cta">
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

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Header title="Interactief leren" showBack />

      <div className="px-4 py-4 space-y-5">
        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">Oefen je kennis</h2>
            <span className="text-xs text-muted-foreground">
              {completedSections.size}/3 voltooid
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quiz" className="text-xs gap-1">
              <Brain className="w-3.5 h-3.5" />
              Quiz
              {completedSections.has('quiz') && <CheckMark />}
            </TabsTrigger>
            <TabsTrigger value="dragdrop" className="text-xs gap-1">
              <GripVertical className="w-3.5 h-3.5" />
              Drag & Drop
              {completedSections.has('dragdrop') && <CheckMark />}
            </TabsTrigger>
            <TabsTrigger value="simulation" className="text-xs gap-1">
              <ListChecks className="w-3.5 h-3.5" />
              Simulatie
              {completedSections.has('simulation') && <CheckMark />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quiz" className="mt-4">
            <div className="rounded-xl border bg-card p-4">
              <QuizComponent
                questions={data.quiz}
                onComplete={handleSectionComplete('quiz')}
              />
            </div>
          </TabsContent>

          <TabsContent value="dragdrop" className="mt-4">
            <div className="rounded-xl border bg-card p-4">
              <DragDropComponent
                exercises={data.drag_drop}
                onComplete={handleSectionComplete('dragdrop')}
              />
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="mt-4">
            <div className="rounded-xl border bg-card p-4">
              <StepSimulationComponent
                title={data.simulation.title}
                steps={data.simulation.steps}
                onComplete={handleSectionComplete('simulation')}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Completion */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success/30 rounded-xl p-5 text-center space-y-3"
          >
            <Trophy className="w-10 h-10 text-success mx-auto" />
            <h3 className="font-bold text-foreground text-lg">Alle oefeningen voltooid!</h3>
            <p className="text-sm text-muted-foreground">
              Je hebt alle interactieve onderdelen afgerond. Goed gedaan!
            </p>
            <Button className="btn-cta w-full" onClick={() => navigate('/ai')}>
              Terug naar AI Klushulp
            </Button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

const CheckMark = () => (
  <span className="w-3 h-3 rounded-full bg-success flex items-center justify-center">
    <svg className="w-2 h-2 text-success-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </span>
);

export default InteractiveTutorialPage;
