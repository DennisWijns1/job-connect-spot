import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Hammer,
  Camera,
  CameraOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

const ARTutorialPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const state = location.state as {
    problem: string;
    category: string;
    riskLevel: string;
    userType: string;
    tutorialData?: TutorialData;
  } | null;

  const [tutorialData, setTutorialData] = useState<TutorialData | null>(
    state?.tutorialData || null
  );
  const [isLoading, setIsLoading] = useState(!state?.tutorialData);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera niet beschikbaar. Controleer de toestemming.');
      setCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  // Fetch tutorial if not passed via state
  useEffect(() => {
    if (!state?.problem) {
      navigate('/ai');
      return;
    }
    if (!tutorialData) {
      fetchTutorial();
    }
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const fetchTutorial = async () => {
    if (!state) return;
    setIsLoading(true);
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
      if (result.ok && result.tutorial) {
        setTutorialData(result.tutorial);
      } else {
        toast({ title: 'Fout', description: result.error || 'Tutorial laden mislukt.', variant: 'destructive' });
        navigate('/ai');
      }
    } catch {
      toast({ title: 'Verbindingsfout', description: 'Probeer het opnieuw.', variant: 'destructive' });
      navigate('/ai');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = () => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(activeStep)) next.delete(activeStep);
      else next.add(activeStep);
      return next;
    });
  };

  const goNext = () => {
    if (tutorialData && activeStep < tutorialData.steps.length - 1) {
      setActiveStep((s) => s + 1);
      setShowDetail(false);
    }
  };

  const goPrev = () => {
    if (activeStep > 0) {
      setActiveStep((s) => s - 1);
      setShowDetail(false);
    }
  };

  const progress = tutorialData
    ? (completedSteps.size / tutorialData.steps.length) * 100
    : 0;

  const currentStep = tutorialData?.steps[activeStep];

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Camera feed - fullscreen background */}
      <div className="absolute inset-0">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            {cameraError ? (
              <div className="text-center space-y-3 px-6">
                <CameraOff className="w-12 h-12 text-white/60 mx-auto" />
                <p className="text-white/80 text-sm">{cameraError}</p>
                <Button variant="outline" size="sm" onClick={startCamera} className="text-white border-white/30">
                  Opnieuw proberen
                </Button>
              </div>
            ) : (
              <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            )}
          </div>
        )}
      </div>

      {/* Semi-transparent overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => { stopCamera(); navigate(-1); }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 mx-4">
          {tutorialData && (
            <div className="space-y-1">
              <p className="text-white text-xs font-medium text-center truncate">
                {tutorialData.tutorial_title}
              </p>
              <Progress value={progress} className="h-1.5 bg-white/20" />
            </div>
          )}
        </div>

        <button
          onClick={cameraActive ? stopCamera : startCamera}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
        >
          {cameraActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" />
            <p className="text-white/80 text-sm">AR Tutorial laden...</p>
          </div>
        </div>
      )}

      {/* AR Overlay - step indicators on screen */}
      {tutorialData && currentStep && !isLoading && (
        <>
          {/* Center overlay indicator - visual cue */}
          <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative"
              >
                {/* Scanning ring animation */}
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-t-2 border-white/60"
                  />
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white drop-shadow-lg">
                      {activeStep + 1}
                    </span>
                    <p className="text-xs text-white/80 mt-1">van {tutorialData.steps.length}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom overlay panel */}
          <div className="relative z-10 px-4 pb-6 space-y-3">
            {/* Step card */}
            <motion.div
              key={`card-${activeStep}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    completedSteps.has(activeStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {completedSteps.has(activeStep) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    activeStep + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm">{currentStep.title}</h3>
                    {currentStep.risk_level === 'YELLOW' && (
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-white/70 text-sm mt-1">{currentStep.description}</p>
                </div>
              </div>

              {/* Tip */}
              {currentStep.tip && (
                <div className="mt-3 bg-amber-500/20 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/90">{currentStep.tip}</p>
                </div>
              )}

              {/* Expand detail */}
              <button
                onClick={() => setShowDetail(!showDetail)}
                className="mt-2 text-xs text-blue-400 underline"
              >
                {showDetail ? 'Minder info' : 'Meer weten?'}
              </button>

              <AnimatePresence>
                {showDetail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-white/60 mt-2 leading-relaxed">
                      {currentStep.detailed_explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={activeStep === 0}
                onClick={goPrev}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Vorige
              </Button>

              <button
                onClick={toggleComplete}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  completedSteps.has(activeStep)
                    ? 'bg-green-500 text-white scale-110'
                    : 'bg-white/20 text-white border-2 border-white/30'
                }`}
              >
                <CheckCircle className="w-6 h-6" />
              </button>

              <Button
                size="sm"
                disabled={activeStep === tutorialData.steps.length - 1}
                onClick={goNext}
                className="flex-1 bg-white/20 border-white/20 text-white hover:bg-white/30"
              >
                Volgende
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* All done */}
            {completedSteps.size === tutorialData.steps.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-center space-y-2"
              >
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                <p className="text-white text-sm font-medium">Alle stappen voltooid!</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 text-white"
                    onClick={() => { stopCamera(); navigate('/ai'); }}
                  >
                    Terug naar AI
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-red-500/80 text-white hover:bg-red-500"
                    onClick={() => { stopCamera(); navigate('/swipe'); }}
                  >
                    <Hammer className="w-4 h-4 mr-1" />
                    Handy nodig?
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Disclaimer */}
            <p className="text-[10px] text-white/40 text-center">{tutorialData.disclaimer}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ARTutorialPage;
