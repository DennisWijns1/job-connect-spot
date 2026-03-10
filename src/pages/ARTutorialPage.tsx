import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, CheckCircle, AlertCircle, Lightbulb, Hammer,
  Camera, CameraOff, ChevronLeft, ChevronRight,
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

interface StepCheckResult {
  correct: boolean;
  confidence: 'high' | 'medium' | 'low';
  feedback: string;
  what_is_visible: string;
  suggestion: string | null;
}

const ARTutorialPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const activeStepRef = useRef(0);
  const tutorialDataRef = useRef<TutorialData | null>(null);

  const state = location.state as {
    problem: string;
    category: string;
    riskLevel: string;
    userType: string;
    tutorialData?: TutorialData;
  } | null;

  const [tutorialData, setTutorialData] = useState<TutorialData | null>(state?.tutorialData || null);
  const [isLoading, setIsLoading] = useState(!state?.tutorialData);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [stepCheckResult, setStepCheckResult] = useState<StepCheckResult | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Keep refs in sync with state for animation loop
  useEffect(() => { activeStepRef.current = activeStep; }, [activeStep]);
  useEffect(() => { tutorialDataRef.current = tutorialData; }, [tutorialData]);

  // Draw AR overlay on canvas
  const drawAROverlay = useCallback((canvas: HTMLCanvasElement, stepIdx: number, pulse: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) return;

    ctx.clearRect(0, 0, W, H);

    const step = tutorialDataRef.current?.steps[stepIdx];
    const isYellow = step?.risk_level === 'YELLOW';
    const bracketColor = isYellow ? 'rgba(251, 191, 36, 0.9)' : 'rgba(255, 255, 255, 0.85)';
    const ringAlpha = 0.35 + Math.sin(pulse) * 0.15;

    // Corner brackets
    const b = Math.min(W, H) * 0.14;
    const m = Math.min(W, H) * 0.08;
    ctx.strokeStyle = bracketColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Top-left
    ctx.beginPath(); ctx.moveTo(m + b, m); ctx.lineTo(m, m); ctx.lineTo(m, m + b); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(W - m - b, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + b); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(m + b, H - m); ctx.lineTo(m, H - m); ctx.lineTo(m, H - m - b); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(W - m - b, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - b); ctx.stroke();

    // Pulsing dashed ring in center
    const cx = W / 2;
    const cy = H * 0.40;
    const r = Math.min(W, H) * 0.13 + Math.sin(pulse) * 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isYellow
      ? `rgba(251, 191, 36, ${ringAlpha})`
      : `rgba(255, 255, 255, ${ringAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair
    const cs = 10;
    ctx.strokeStyle = bracketColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - cs, cy); ctx.lineTo(cx - 4, cy);
    ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + cs, cy);
    ctx.moveTo(cx, cy - cs); ctx.lineTo(cx, cy - 4);
    ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy + cs);
    ctx.stroke();
  }, []);

  // Animation loop — runs once when camera becomes active
  useEffect(() => {
    if (!cameraActive) return;

    let pulse = 0;
    let rafId: number;

    const resizeCanvas = () => {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth;
        canvasRef.current.height = videoRef.current.clientHeight;
      }
    };

    const startLoop = () => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const animate = () => {
        pulse += 0.04;
        if (canvasRef.current) {
          drawAROverlay(canvasRef.current, activeStepRef.current, pulse);
        }
        rafId = requestAnimationFrame(animate);
      };
      rafId = requestAnimationFrame(animate);
      animFrameRef.current = rafId;
    };

    if (videoRef.current && videoRef.current.readyState >= 2) {
      startLoop();
    } else {
      videoRef.current?.addEventListener('loadeddata', startLoop, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [cameraActive, drawAROverlay]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
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
      setCameraError('Camera niet beschikbaar. Controleer de cameratoestemming in je browser of apparaat.');
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (!state?.problem) { navigate('/ai'); return; }
    if (!tutorialData) fetchTutorial();
    startCamera();
    return () => stopCamera();
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

  // Capture frame from camera and send to AI for step verification
  const captureAndCheck = useCallback(async () => {
    if (!videoRef.current || !cameraActive || isChecking) return;
    const currentStep = tutorialDataRef.current?.steps[activeStepRef.current];
    if (!currentStep) return;

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const snap = document.createElement('canvas');
    snap.width = video.videoWidth || 1280;
    snap.height = video.videoHeight || 720;
    snap.getContext('2d')?.drawImage(video, 0, 0);
    const base64 = snap.toDataURL('image/jpeg', 0.85).split(',')[1];

    setIsChecking(true);
    setStepCheckResult(null);

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
            userType: state?.userType || 'seeker',
            message: currentStep.description,
            photo: base64,
            mode: 'step-check',
            category: state?.category,
            stepTitle: currentStep.title,
            stepNumber: activeStepRef.current + 1,
            totalSteps: tutorialDataRef.current?.steps.length,
            categoryHint: null,
          }),
        }
      );
      const result = await response.json();
      if (result.ok && result.step_check) {
        setStepCheckResult(result.step_check);
        if (result.step_check.correct) {
          setCompletedSteps((prev) => new Set([...prev, activeStepRef.current]));
        }
      } else {
        toast({ title: 'Analyse mislukt', description: 'Probeer opnieuw.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Verbindingsfout', description: 'Controleer je netwerk.', variant: 'destructive' });
    } finally {
      setIsChecking(false);
    }
  }, [cameraActive, isChecking, state]);

  const goNext = () => {
    if (tutorialData && activeStep < tutorialData.steps.length - 1) {
      setActiveStep((s) => s + 1);
      setShowDetail(false);
      setStepCheckResult(null);
    }
  };

  const goPrev = () => {
    if (activeStep > 0) {
      setActiveStep((s) => s - 1);
      setShowDetail(false);
      setStepCheckResult(null);
    }
  };

  const toggleComplete = () => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(activeStep)) next.delete(activeStep);
      else next.add(activeStep);
      return next;
    });
    setStepCheckResult(null);
  };

  const progress = tutorialData ? (completedSteps.size / tutorialData.steps.length) * 100 : 0;
  const currentStep = tutorialData?.steps[activeStep];
  const isStepComplete = completedSteps.has(activeStep);

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">

      {/* Camera feed + AR canvas */}
      <div className="absolute inset-0">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            {cameraError ? (
              <div className="text-center space-y-4 px-8">
                <CameraOff className="w-14 h-14 text-white/40 mx-auto" />
                <p className="text-white/70 text-sm leading-relaxed">{cameraError}</p>
                <Button variant="outline" onClick={startCamera} className="text-white border-white/30 bg-white/10">
                  <Camera className="w-4 h-4 mr-2" /> Opnieuw proberen
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <Loader2 className="w-10 h-10 text-white/50 animate-spin mx-auto" />
                <p className="text-white/50 text-sm">Camera starten...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flash effect on capture */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white z-30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/88 pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => { stopCamera(); navigate(-1); }}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 mx-4">
          {tutorialData && (
            <div className="space-y-1">
              <p className="text-white text-xs font-medium text-center truncate">{tutorialData.tutorial_title}</p>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="h-1.5 bg-white/20 flex-1" />
                <span className="text-white/55 text-xs">{completedSteps.size}/{tutorialData.steps.length}</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={cameraActive ? stopCamera : startCamera}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white"
        >
          {cameraActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 bg-black/50 backdrop-blur-md rounded-2xl p-6">
            <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" />
            <p className="text-white/80 text-sm">AR Tutorial laden...</p>
          </div>
        </div>
      )}

      {/* Main AR content */}
      {tutorialData && currentStep && !isLoading && (
        <>
          {/* Step dots */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-3">
            <div className="flex gap-1.5">
              {tutorialData.steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeStep ? 'w-5 h-2 bg-white' :
                    completedSteps.has(i) ? 'w-2 h-2 bg-green-400' :
                    'w-2 h-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom panel */}
          <div className="relative z-10 px-4 pb-6 space-y-2">

            {/* Step check result */}
            <AnimatePresence>
              {stepCheckResult && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className={`rounded-2xl p-3.5 border backdrop-blur-xl ${
                    stepCheckResult.correct
                      ? 'bg-green-500/20 border-green-500/40'
                      : 'bg-amber-500/20 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stepCheckResult.correct ? 'bg-green-500' : 'bg-amber-500'
                    }`}>
                      {stepCheckResult.correct
                        ? <CheckCircle className="w-5 h-5 text-white" />
                        : <AlertCircle className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">
                        {stepCheckResult.correct ? 'Stap correct!' : 'Nog niet helemaal'}
                      </p>
                      <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{stepCheckResult.feedback}</p>
                      {stepCheckResult.what_is_visible && (
                        <p className="text-white/45 text-xs mt-1 italic">Zichtbaar: {stepCheckResult.what_is_visible}</p>
                      )}
                      {stepCheckResult.suggestion && (
                        <p className="text-amber-300 text-xs mt-1.5 font-medium">→ {stepCheckResult.suggestion}</p>
                      )}
                    </div>
                    <button onClick={() => setStepCheckResult(null)} className="text-white/40 hover:text-white/70 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step card */}
            <motion.div
              key={`card-${activeStep}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/65 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  isStepComplete ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {isStepComplete ? <CheckCircle className="w-5 h-5" /> : activeStep + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm">{currentStep.title}</h3>
                    {currentStep.risk_level === 'YELLOW' && (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-white/70 text-xs mt-1 leading-relaxed">{currentStep.description}</p>
                </div>
              </div>

              {currentStep.tip && (
                <div className="mt-3 bg-amber-500/15 border border-amber-500/25 rounded-xl p-2.5 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/80">{currentStep.tip}</p>
                </div>
              )}

              <button
                onClick={() => setShowDetail(!showDetail)}
                className="mt-2 text-xs text-blue-400 underline"
              >
                {showDetail ? 'Minder info' : 'Meer weten?'}
              </button>

              <AnimatePresence>
                {showDetail && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs text-white/55 mt-2 leading-relaxed overflow-hidden"
                  >
                    {currentStep.detailed_explanation}
                  </motion.p>
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
                <ChevronLeft className="w-4 h-4 mr-1" /> Vorige
              </Button>

              {/* Capture button */}
              <button
                onClick={captureAndCheck}
                disabled={isChecking || !cameraActive}
                title="Maak foto om stap te controleren"
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg border-4 ${
                  isChecking
                    ? 'bg-white/20 border-white/20 cursor-not-allowed'
                    : 'bg-white border-white/80 hover:scale-105 active:scale-95'
                }`}
              >
                {isChecking
                  ? <Loader2 className="w-7 h-7 text-white animate-spin" />
                  : <Camera className="w-7 h-7 text-black" />
                }
              </button>

              <Button
                size="sm"
                disabled={activeStep === tutorialData.steps.length - 1}
                onClick={goNext}
                className="flex-1 bg-white/15 border-white/20 text-white hover:bg-white/25"
              >
                Volgende <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Manual complete toggle */}
            <button
              onClick={toggleComplete}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all border ${
                isStepComplete
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'bg-white/8 border-white/15 text-white/55'
              }`}
            >
              {isStepComplete ? '✓ Stap voltooid' : 'Stap handmatig voltooien'}
            </button>

            {/* All done */}
            {completedSteps.size === tutorialData.steps.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 text-center space-y-3"
              >
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                <p className="text-white font-semibold">Alle stappen voltooid!</p>
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
                    <Hammer className="w-4 h-4 mr-1" /> Handy nodig?
                  </Button>
                </div>
              </motion.div>
            )}

            <p className="text-[10px] text-white/30 text-center">{tutorialData.disclaimer}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ARTutorialPage;
