import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Send, Camera, Bot, Wrench, Lightbulb, Droplets, Hammer, Users, TrendingUp, Clock, AlertTriangle, CheckCircle, AlertCircle, BookOpen, ArrowRight, X, Mic, MicOff, Volume2, VolumeX, History, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition, speakText, stopSpeaking } from '@/hooks/use-speech';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  type Conversation,
  type StoredMessage,
  getConversations,
  getActiveConversationId,
  setActiveConversationId,
  saveConversation,
  deleteConversation,
  generateConversationTitle,
} from '@/stores/aiConversationStore';

interface VisualMarker {
  type: 'circle' | 'arrow';
  x: number;
  y: number;
  radius: number | null;
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

// HM_AI_V1 contract interface
interface AIResponse {
  debug_contract_version: string;
  user_type: 'seeker' | 'handy';
  input_type: 'text_only' | 'text_with_photo';
  vision_confidence: 'high' | 'medium' | 'low' | null;
  understood: boolean;
  risk_level: 'GREEN' | 'YELLOW' | 'RED';
  category: string;
  main_issue: string | null;
  issue_location_description: string | null;
  what_is_visible: string[];
  visual_markers: VisualMarker[];
  suggested_steps: string[];
  stop_conditions: string[];
  next_action: 'continue_self_fix' | 'request_more_info' | 'lesson' | 'book_handy';
  lesson_suggestion: { 
    suggested: boolean; 
    topic: string | null;
  };
  handy_suggestion: { 
    suggested: boolean; 
    reason: string | null;
  };
  explanation_if_uncertain: string | null;
  disclaimer: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  aiResponse?: AIResponse;
  photoUrl?: string;
}

function messagesToStored(messages: Message[]): StoredMessage[] {
  return messages.map(m => ({
    ...m,
    timestamp: m.timestamp.toISOString(),
  }));
}

function storedToMessages(stored: StoredMessage[]): Message[] {
  return stored.map(m => ({
    ...m,
    timestamp: new Date(m.timestamp),
  }));
}

const AIHelpPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  const seekerSuggestions = [
    { icon: Lightbulb, text: 'Lamp flikkert constant', category: 'Elektriciteit' },
    { icon: Droplets, text: 'Afvoer loopt niet door', category: 'Afvoer' },
    { icon: Hammer, text: 'Tegel is gebarsten', category: 'Muren/Verf' },
    { icon: Wrench, text: 'Kraan lekt water', category: 'Sanitair' },
  ];

  const handySuggestions = [
    { icon: TrendingUp, text: 'Hoe stel ik een eerlijke prijs?', category: 'Advies' },
    { icon: Users, text: 'Tips voor klantencontact', category: 'Communicatie' },
    { icon: Clock, text: 'Efficiënt plannen van klussen', category: 'Planning' },
    { icon: Hammer, text: 'Gereedschap aanbevelingen', category: 'Materiaal' },
  ];

  const suggestedProblems = isHandy ? handySuggestions : seekerSuggestions;

  const initialMessage = isHandy
    ? 'Hallo! 👋 Ik ben je AI assistent voor handymen. Ik kan je helpen met prijsadvies, klantencontact, planningtips en meer. Hoe kan ik je vandaag helpen?'
    : 'Hallo! 👋 Ik ben je AI klushulp. Beschrijf je probleem of upload een foto, en ik help je met een oplossing. Als het te complex is, kan ik een Handy in de buurt voorstellen.';

  const getInitialMessages = (): Message[] => [{
    id: '1',
    role: 'assistant',
    content: initialMessage,
    timestamp: new Date(),
  }];

  // Load active conversation or start fresh
  const [conversationId, setConversationId] = useState<string>(() => {
    const activeId = getActiveConversationId();
    if (activeId) {
      const convos = getConversations();
      const found = convos.find(c => c.id === activeId);
      if (found) return found.id;
    }
    return Date.now().toString();
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const activeId = getActiveConversationId();
    if (activeId) {
      const convos = getConversations();
      const found = convos.find(c => c.id === activeId);
      if (found && found.messages.length > 0) {
        return storedToMessages(found.messages);
      }
    }
    return getInitialMessages();
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const { isListening, transcript, startListening, stopListening, isSupported: speechSupported } = useSpeechRecognition();

  // Persist conversation whenever messages change
  useEffect(() => {
    if (messages.length > 1) {
      const convo: Conversation = {
        id: conversationId,
        title: generateConversationTitle(messagesToStored(messages)),
        messages: messagesToStored(messages),
        createdAt: messages[0]?.timestamp.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveConversation(convo);
      setActiveConversationId(conversationId);
    }
  }, [messages, conversationId]);

  // Sync speech transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-send when speech recognition stops and there's a transcript
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      const timer = setTimeout(() => {
        handleSend();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript]);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text);
      if ('speechSynthesis' in window) {
        const checkSpeaking = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false);
            clearInterval(checkSpeaking);
          }
        }, 200);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePhotoFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    processPhoto(e.target.files?.[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoFromCamera = (e: React.ChangeEvent<HTMLInputElement>) => {
    processPhoto(e.target.files?.[0]);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const processPhoto = (file?: File | null) => {
    if (!file) return;
    setShowCameraMenu(false);

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Bestand te groot', description: 'Maximaal 5MB toegestaan.', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setPhotoBase64(base64);
      setPhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoBase64(null);
    setPhotoPreview(null);
  };

  const sendToAI = async (messageText: string, photo: string | null, photoPreviewUrl: string | null) => {
    setIsTyping(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const body: any = {
        message: messageText,
        userType: isHandy ? 'handy' : 'seeker',
        categoryHint: null,
      };
      if (photo) {
        body.photo = photo;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok || !result.ok) {
        const errorMessage = result.error || `Fout: ${response.status}`;
        const fallbackData = result.fallback;

        toast({ title: 'AI Fout', description: errorMessage, variant: 'destructive' });

        if (fallbackData) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fallbackData.summary || fallbackData.explanation_if_uncertain || 'Er ging iets mis.',
            timestamp: new Date(),
            aiResponse: fallbackData,
            photoUrl: photoPreviewUrl || undefined,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          const errorAiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `❌ ${errorMessage}\n\nProbeer het opnieuw of neem contact op met een Handy.`,
            timestamp: new Date(),
            isError: true,
          };
          setMessages((prev) => [...prev, errorAiMessage]);
        }
      } else {
        const aiResponse: AIResponse = result.data;
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.main_issue || aiResponse.explanation_if_uncertain || 'Analyse voltooid',
          timestamp: new Date(),
          aiResponse,
          photoUrl: photoPreviewUrl || undefined,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI assist error:', error);
      
      let errorMessage = 'Er is een fout opgetreden. Probeer het opnieuw.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'De AI reageert niet op tijd. Probeer het later opnieuw.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Geen internetverbinding. Controleer je netwerk en probeer opnieuw.';
        }
      }

      toast({ title: 'Verbindingsfout', description: errorMessage, variant: 'destructive' });

      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !photoBase64) return;

    const messageText = input.trim() || (photoBase64 ? 'Bekijk deze foto en analyseer het probleem.' : '');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      photoUrl: photoPreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPhoto = photoBase64;
    const currentPhotoPreview = photoPreview;
    setInput('');
    clearPhoto();

    await sendToAI(messageText, currentPhoto, currentPhotoPreview);
  };

  const handleSuggestion = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await sendToAI(text, null, null);
  };

  const handleCTAClick = (action: 'self_fix' | 'lesson' | 'book_handy', topic?: string) => {
    if (action === 'book_handy') {
      navigate('/swipe');
    } else if (action === 'lesson' && topic) {
      navigate(`/learning?topic=${encodeURIComponent(topic)}`);
    }
  };

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    setConversationId(newId);
    setMessages(getInitialMessages());
    setActiveConversationId(newId);
    setShowHistory(false);
  };

  const handleLoadConversation = (convo: Conversation) => {
    setConversationId(convo.id);
    setMessages(storedToMessages(convo.messages));
    setActiveConversationId(convo.id);
    setShowHistory(false);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    if (id === conversationId) {
      handleNewConversation();
    } else {
      // Force re-render
      setShowHistory(false);
      setTimeout(() => setShowHistory(true), 0);
    }
  };

  const getRiskStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case 'GREEN':
        return { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', icon: CheckCircle };
      case 'RED':
        return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', icon: AlertTriangle };
      default:
        return { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent-foreground', icon: AlertCircle };
    }
  };

  const renderPhotoWithOverlay = (photoUrl: string, markers: VisualMarker[]) => {
    return (
      <div className="relative w-full rounded-xl overflow-hidden mb-3">
        <img src={photoUrl} alt="Analyse foto" className="w-full h-auto block" />
        {markers.length > 0 && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1 1" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
            {markers.map((marker, i) => {
              if (marker.type === 'circle') {
                return <circle key={i} cx={marker.x} cy={marker.y} r={marker.radius || 0.05} fill="none" stroke="red" strokeWidth="0.005" />;
              }
              if (marker.type === 'arrow') {
                const arrowLen = 0.08;
                let dx = 0, dy = 0;
                switch (marker.direction) {
                  case 'up': dy = -arrowLen; break;
                  case 'down': dy = arrowLen; break;
                  case 'left': dx = -arrowLen; break;
                  case 'right': dx = arrowLen; break;
                  default: dy = -arrowLen;
                }
                return (
                  <g key={i}>
                    <line x1={marker.x} y1={marker.y} x2={marker.x + dx} y2={marker.y + dy} stroke="red" strokeWidth="0.005" />
                    <circle cx={marker.x + dx} cy={marker.y + dy} r="0.008" fill="red" />
                  </g>
                );
              }
              return null;
            })}
          </svg>
        )}
      </div>
    );
  };

  const renderAIResponse = (aiResponse: AIResponse, messagePhotoUrl?: string) => {
    const riskStyles = getRiskStyles(aiResponse.risk_level);
    const RiskIcon = riskStyles.icon;
    
    const riskBadgeText = aiResponse.risk_level === 'GREEN' 
      ? '✓ Veilig zelf te doen' 
      : aiResponse.risk_level === 'YELLOW' 
      ? '⚠ Voorzichtigheid geboden' 
      : '⛔ Schakel een professional in';

    return (
      <div className="space-y-4">
        {messagePhotoUrl && aiResponse.input_type === 'text_with_photo' && (
          renderPhotoWithOverlay(messagePhotoUrl, aiResponse.visual_markers || [])
        )}

        {aiResponse.vision_confidence === 'low' && (
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-sm text-muted-foreground">📷 De foto is onduidelijk. Stuur een nieuwe, scherpere foto voor een betere analyse.</p>
          </div>
        )}

        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${riskStyles.bg} ${riskStyles.border} border`}>
          <RiskIcon className={`w-4 h-4 ${riskStyles.text}`} />
          <span className={riskStyles.text}>{riskBadgeText}</span>
        </div>

        {aiResponse.main_issue && (
          <div>
            <h3 className="font-semibold text-foreground">{aiResponse.main_issue}</h3>
            <span className="text-xs text-muted-foreground">{aiResponse.category}</span>
          </div>
        )}

        {aiResponse.issue_location_description && (
          <p className="text-sm text-foreground">{aiResponse.issue_location_description}</p>
        )}

        {aiResponse.what_is_visible && aiResponse.what_is_visible.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Wat ik zie</h4>
            <ul className="space-y-1">
              {aiResponse.what_is_visible.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-accent mt-0.5">●</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!aiResponse.understood && aiResponse.explanation_if_uncertain && (
          <div className="bg-muted/50 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">❓ Meer info nodig</h4>
            <p className="text-sm">{aiResponse.explanation_if_uncertain}</p>
          </div>
        )}

        {aiResponse.understood && aiResponse.suggested_steps && aiResponse.suggested_steps.length > 0 && aiResponse.risk_level !== 'RED' && aiResponse.vision_confidence !== 'low' && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">📋 Stappenplan</h4>
            <ol className="space-y-2">
              {aiResponse.suggested_steps.map((step, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {aiResponse.stop_conditions && aiResponse.stop_conditions.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-destructive uppercase mb-2">⛔ Stopcondities</h4>
            <ul className="space-y-1">
              {aiResponse.stop_conditions.map((condition, i) => (
                <li key={i} className="text-sm text-destructive/90">{condition}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 space-y-2">
          {aiResponse.understood && aiResponse.suggested_steps && aiResponse.suggested_steps.length > 0 && aiResponse.risk_level !== 'RED' && (
            <Button
              className="w-full btn-forest"
              onClick={() => navigate('/tutorial', {
                state: {
                  problem: aiResponse.main_issue || '',
                  category: aiResponse.category,
                  riskLevel: aiResponse.risk_level,
                  userType: isHandy ? 'handy' : 'seeker',
                }
              })}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Bekijk interactieve tutorial
            </Button>
          )}

          {aiResponse.next_action === 'continue_self_fix' && (
            <Button className="w-full btn-cta" onClick={() => handleCTAClick('self_fix')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Ik probeer dit zelf
            </Button>
          )}
          
          {aiResponse.next_action === 'lesson' && aiResponse.lesson_suggestion.suggested && aiResponse.lesson_suggestion.topic && (
            <Button className="w-full btn-cta" onClick={() => handleCTAClick('lesson', aiResponse.lesson_suggestion.topic!)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Bekijk les: {aiResponse.lesson_suggestion.topic}
            </Button>
          )}
          
          {!isHandy && (aiResponse.next_action === 'book_handy' || aiResponse.handy_suggestion.suggested) && (
            <Button 
              className={`w-full ${aiResponse.risk_level === 'RED' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'btn-cta'}`}
              onClick={() => handleCTAClick('book_handy')}
            >
              <Hammer className="w-4 h-4 mr-2" />
              Schakel een Handy in
              {aiResponse.risk_level === 'RED' && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Dringend</span>
              )}
            </Button>
          )}
          
          {aiResponse.handy_suggestion.reason && (
            <p className="text-xs text-muted-foreground text-center">{aiResponse.handy_suggestion.reason}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground flex-1">{aiResponse.disclaimer}</p>
          {'speechSynthesis' in window && (
            <button
              onClick={() => {
                const speakContent = [aiResponse.main_issue, ...(aiResponse.suggested_steps || [])].filter(Boolean).join('. ');
                handleSpeak(speakContent);
              }}
              className="ml-2 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title={isSpeaking ? 'Stop voorlezen' : 'Lees voor'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Custom header with history icon */}
      <header className="sticky top-0 z-40 safe-area-top gradient-teal text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-display font-bold text-lg">{isHandy ? 'AI Assistent' : 'AI Klushulp'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              title="Nieuw gesprek"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative"
              title="Gespreksgeschiedenis"
            >
              <History className="w-5 h-5" />
              {getConversations().length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {getConversations().length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-background border-l border-border z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display font-bold text-foreground">Gesprekken</h3>
                <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                {getConversations().length === 0 ? (
                  <div className="p-8 text-center">
                    <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nog geen gesprekken</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {getConversations().map(convo => (
                      <button
                        key={convo.id}
                        onClick={() => handleLoadConversation(convo)}
                        className={`w-full text-left p-3 rounded-xl hover:bg-muted transition-colors group ${
                          convo.id === conversationId ? 'bg-primary/5 border border-primary/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{convo.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(convo.updatedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteConversation(convo.id, e)}
                            className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Camera choice menu */}
      <AnimatePresence>
        {showCameraMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setShowCameraMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-36 left-4 bg-card rounded-xl shadow-card-hover border border-border z-50 overflow-hidden"
            >
              <button
                onClick={() => { setShowCameraMenu(false); cameraInputRef.current?.click(); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                <Camera className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Maak een foto</span>
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => { fileInputRef.current?.click(); setShowCameraMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Kies uit bestanden</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 ${message.isError ? 'bg-destructive' : 'bg-primary'}`}>
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'rounded-br-sm text-white'
                    : message.isError
                    ? 'bg-destructive/10 border border-destructive/20 rounded-bl-sm'
                    : 'bg-primary/5 shadow-soft rounded-bl-sm border border-primary/10'
                }`}
                style={message.role === 'user' ? { backgroundColor: 'hsl(330, 65%, 55%)' } : {}}
              >
                {message.role === 'user' && message.photoUrl && (
                  <img src={message.photoUrl} alt="Bijgevoegde foto" className="w-full rounded-lg mb-2" />
                )}
                {message.role === 'assistant' && message.aiResponse ? (
                  renderAIResponse(message.aiResponse, message.photoUrl)
                ) : (
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="bg-card shadow-soft rounded-2xl rounded-bl-sm p-4 border border-border">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground mb-3">
            {isHandy ? 'Veelgestelde vragen:' : 'Veelvoorkomende problemen:'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedProblems.map((problem, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestion(problem.text)}
                className="p-3 bg-card rounded-xl text-left hover:bg-secondary hover:shadow-soft transition-all group border border-border"
              >
                <problem.icon className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">{problem.text}</p>
                <p className="text-xs text-muted-foreground">{problem.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo preview */}
      {photoPreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img src={photoPreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
            <button onClick={clearPhoto} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFromFile} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoFromCamera} />

      {/* Input */}
      <div className="sticky bottom-24 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-4">
        <div className="flex items-center gap-3">
          <button 
            className="w-12 h-12 rounded-xl bg-card shadow-soft flex items-center justify-center text-muted-foreground hover:text-accent transition-colors border border-border"
            onClick={() => setShowCameraMenu(!showCameraMenu)}
          >
            <Camera className="w-6 h-6" />
          </button>
          {speechSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isTyping}
              className={`w-12 h-12 rounded-xl shadow-soft flex items-center justify-center transition-colors border ${
                isListening
                  ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border'
              }`}
              title={isListening ? 'Stop opname' : 'Spreek in'}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
              placeholder={isListening ? 'Luisteren...' : isHandy ? 'Stel je vraag...' : 'Beschrijf je probleem...'}
              className="h-12 rounded-xl pr-12 bg-card border-border"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !photoBase64) || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AIHelpPage;
