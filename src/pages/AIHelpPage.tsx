import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Send, Camera, Bot, Wrench, Lightbulb, Droplets, Hammer, Users, TrendingUp, Clock, AlertTriangle, CheckCircle, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AIResponse {
  title: string;
  category: string;
  risk_level: 'GREEN' | 'YELLOW' | 'RED';
  risk_badge: string;
  summary: string;
  likely_causes: string[];
  questions_to_confirm: string[];
  step_by_step: string[];
  tools_needed: string[];
  materials_needed: string[];
  stop_conditions: string[];
  next_best_action: 'self_fix' | 'lesson' | 'book_handy';
  lesson_suggestion: { suggested: boolean; topic: string; why: string };
  handy_suggestion: { suggested: boolean; why: string; urgency: 'low' | 'medium' | 'high' };
  disclaimer_short: string;
  confidence: number;
  confidence_note: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  aiResponse?: AIResponse;
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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: messageText,
            userType: isHandy ? 'handy' : 'seeker',
            photoProvided: false,
            categoryHint: null,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok || !result.ok) {
        const errorMessage = result.error || `Fout: ${response.status}`;
        const fallbackData = result.fallback;

        toast({
          title: 'AI Fout',
          description: errorMessage,
          variant: 'destructive',
        });

        if (fallbackData) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fallbackData.summary,
            timestamp: new Date(),
            aiResponse: fallbackData,
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
          content: aiResponse.summary,
          timestamp: new Date(),
          aiResponse,
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

      toast({
        title: 'Verbindingsfout',
        description: errorMessage,
        variant: 'destructive',
      });

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

  const handleSuggestion = async (text: string) => {
    // Directly submit the suggestion to AI instead of filling the input
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: text,
            userType: isHandy ? 'handy' : 'seeker',
            photoProvided: false,
            categoryHint: null,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok || !result.ok) {
        const errorMessage = result.error || `Fout: ${response.status}`;
        const fallbackData = result.fallback;

        toast({
          title: 'AI Fout',
          description: errorMessage,
          variant: 'destructive',
        });

        if (fallbackData) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fallbackData.summary,
            timestamp: new Date(),
            aiResponse: fallbackData,
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
          content: aiResponse.summary,
          timestamp: new Date(),
          aiResponse,
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

      toast({
        title: 'Verbindingsfout',
        description: errorMessage,
        variant: 'destructive',
      });

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

  const handleCTAClick = (action: 'self_fix' | 'lesson' | 'book_handy', topic?: string) => {
    if (action === 'book_handy') {
      navigate('/swipe');
    } else if (action === 'lesson' && topic) {
      navigate(`/learning?topic=${encodeURIComponent(topic)}`);
    }
  };

  const getRiskStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case 'GREEN':
        return {
          bg: 'bg-success/10',
          border: 'border-success/30',
          text: 'text-success',
          icon: CheckCircle,
        };
      case 'RED':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          text: 'text-destructive',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-accent/10',
          border: 'border-accent/30',
          text: 'text-accent-foreground',
          icon: AlertCircle,
        };
    }
  };

  const renderAIResponse = (aiResponse: AIResponse) => {
    const riskStyles = getRiskStyles(aiResponse.risk_level);
    const RiskIcon = riskStyles.icon;

    return (
      <div className="space-y-4">
        {/* Risk Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${riskStyles.bg} ${riskStyles.border} border`}>
          <RiskIcon className={`w-4 h-4 ${riskStyles.text}`} />
          <span className={riskStyles.text}>{aiResponse.risk_badge}</span>
        </div>

        {/* Title & Category */}
        <div>
          <h3 className="font-semibold text-foreground">{aiResponse.title}</h3>
          <span className="text-xs text-muted-foreground">{aiResponse.category}</span>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground">{aiResponse.summary}</p>

        {/* Likely Causes */}
        {aiResponse.likely_causes.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Mogelijke oorzaken</h4>
            <ul className="space-y-1">
              {aiResponse.likely_causes.map((cause, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions to Confirm */}
        {aiResponse.questions_to_confirm.length > 0 && (
          <div className="bg-muted/50 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">❓ Vragen om te bevestigen</h4>
            <ul className="space-y-1">
              {aiResponse.questions_to_confirm.map((q, i) => (
                <li key={i} className="text-sm">{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step by Step */}
        {aiResponse.step_by_step.length > 0 && aiResponse.risk_level !== 'RED' && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">📋 Stappenplan</h4>
            <ol className="space-y-2">
              {aiResponse.step_by_step.map((step, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tools & Materials */}
        {(aiResponse.tools_needed.length > 0 || aiResponse.materials_needed.length > 0) && (
          <div className="flex flex-wrap gap-4">
            {aiResponse.tools_needed.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">🔧 Gereedschap</h4>
                <div className="flex flex-wrap gap-1">
                  {aiResponse.tools_needed.map((tool, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{tool}</span>
                  ))}
                </div>
              </div>
            )}
            {aiResponse.materials_needed.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">📦 Materialen</h4>
                <div className="flex flex-wrap gap-1">
                  {aiResponse.materials_needed.map((mat, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{mat}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stop Conditions */}
        {aiResponse.stop_conditions.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-destructive uppercase mb-2">⛔ Stopcondities</h4>
            <ul className="space-y-1">
              {aiResponse.stop_conditions.map((condition, i) => (
                <li key={i} className="text-sm text-destructive/90">{condition}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="pt-2 space-y-2">
          {aiResponse.next_best_action === 'self_fix' && (
            <Button 
              className="w-full btn-cta"
              onClick={() => handleCTAClick('self_fix')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Ik probeer dit zelf
            </Button>
          )}
          
          {aiResponse.next_best_action === 'lesson' && aiResponse.lesson_suggestion.suggested && (
            <Button 
              className="w-full btn-forest"
              onClick={() => handleCTAClick('lesson', aiResponse.lesson_suggestion.topic)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Bekijk les: {aiResponse.lesson_suggestion.topic}
            </Button>
          )}
          
          {(aiResponse.next_best_action === 'book_handy' || aiResponse.handy_suggestion.suggested) && (
            <Button 
              className={`w-full ${aiResponse.risk_level === 'RED' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'btn-cta'}`}
              onClick={() => handleCTAClick('book_handy')}
            >
              <Hammer className="w-4 h-4 mr-2" />
              Schakel een Handy in
              {aiResponse.handy_suggestion.urgency === 'high' && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Dringend</span>
              )}
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          {aiResponse.disclaimer_short}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Header title={isHandy ? 'AI Assistent' : 'AI Klushulp'} showBack />

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
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : message.isError
                    ? 'bg-destructive/10 border border-destructive/20 rounded-bl-sm'
                    : 'bg-card shadow-soft rounded-bl-sm border border-border'
                }`}
              >
                {message.role === 'assistant' && message.aiResponse ? (
                  renderAIResponse(message.aiResponse)
                ) : (
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-4"
          >
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
      {messages.length === 1 && (
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

      {/* Input */}
      <div className="sticky bottom-24 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-4">
        <div className="flex items-center gap-3">
          {!isHandy && (
            <button 
              className="w-12 h-12 rounded-xl bg-card shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border"
              onClick={() => toast({ title: 'Foto upload', description: 'Foto upload wordt binnenkort toegevoegd!' })}
            >
              <Camera className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
              placeholder={isHandy ? 'Stel je vraag...' : 'Beschrijf je probleem...'}
              className="h-12 rounded-xl pr-12 bg-card border-border"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
