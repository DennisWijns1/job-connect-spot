import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Send, Camera, Bot, Wrench, Lightbulb, Droplets, Hammer, Users, TrendingUp, Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface AIResponse {
  category: string;
  risk_level: 'green' | 'yellow' | 'red';
  summary: string;
  likely_causes: string[];
  questions_to_confirm: string[];
  steps: string[];
  tools_needed: string[];
  materials_needed: string[];
  stop_conditions: string[];
  recommend_handy: boolean;
  handy_reason: string;
}

const formatAIResponse = (response: AIResponse): string => {
  const riskEmoji = response.risk_level === 'red' ? '🔴' : response.risk_level === 'yellow' ? '🟡' : '🟢';
  const riskLabel = response.risk_level === 'red' ? 'HOOG RISICO' : response.risk_level === 'yellow' ? 'LET OP' : 'VEILIG';
  
  let formatted = `${riskEmoji} **${riskLabel}** | 🔎 ${response.category}\n\n`;
  formatted += `**Samenvatting:** ${response.summary}\n\n`;

  if (response.likely_causes.length > 0) {
    formatted += `**Mogelijke oorzaken:**\n`;
    response.likely_causes.forEach(cause => {
      formatted += `• ${cause}\n`;
    });
    formatted += '\n';
  }

  if (response.questions_to_confirm.length > 0) {
    formatted += `**❓ Vragen om te bevestigen:**\n`;
    response.questions_to_confirm.forEach(q => {
      formatted += `• ${q}\n`;
    });
    formatted += '\n';
  }

  if (response.steps.length > 0 && response.risk_level !== 'red') {
    formatted += `**📋 Stappenplan:**\n`;
    response.steps.forEach((step, i) => {
      formatted += `${i + 1}. ${step}\n`;
    });
    formatted += '\n';
  }

  if (response.tools_needed.length > 0) {
    formatted += `**🔧 Gereedschap:** ${response.tools_needed.join(', ')}\n`;
  }

  if (response.materials_needed.length > 0) {
    formatted += `**📦 Materialen:** ${response.materials_needed.join(', ')}\n`;
  }

  if (response.stop_conditions.length > 0) {
    formatted += `\n**⛔ Stopcondities:**\n`;
    response.stop_conditions.forEach(condition => {
      formatted += `• ${condition}\n`;
    });
  }

  // CTA based on risk level
  formatted += '\n---\n';
  if (response.risk_level === 'red') {
    formatted += `⚠️ **Stop – schakel een Handy in**\n`;
    if (response.handy_reason) {
      formatted += `_${response.handy_reason}_\n`;
    }
  } else if (response.risk_level === 'yellow') {
    formatted += `💡 **Twijfel je? Schakel een Handy in**\n`;
  } else {
    formatted += `✅ **Lukt het niet na 2 pogingen? Schakel een Handy in**\n`;
  }

  formatted += '\n_Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in._';

  return formatted;
};

const AIHelpPage = () => {
  const { toast } = useToast();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  // Different suggestions for seekers vs handymen
  const seekerSuggestions = [
    { icon: Lightbulb, text: 'Lamp flikkert constant', category: 'Elektriciteit' },
    { icon: Droplets, text: 'Afvoer loopt niet door', category: 'Loodgieter' },
    { icon: Hammer, text: 'Tegel is gebarsten', category: 'Tegels' },
    { icon: Wrench, text: 'Kraan lekt water', category: 'Loodgieter' },
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
      // Create AbortController for timeout
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
            text: messageText,
            userType: isHandy ? 'handy' : 'seeker',
            images: [],
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Fout: ${response.status}`);
      }

      const aiResponse: AIResponse = await response.json();
      const formattedContent = formatAIResponse(aiResponse);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formattedContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI assist error:', error);
      
      let errorMessage = 'Er is een fout opgetreden. Probeer het opnieuw.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'De AI reageert niet op tijd. Probeer het later opnieuw.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Geen internetverbinding. Controleer je netwerk en probeer opnieuw.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'AI Fout',
        description: errorMessage,
        variant: 'destructive',
      });

      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Fout:** ${errorMessage}\n\n_Probeer het opnieuw of neem contact op met een Handy._`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  const getRiskIcon = (content: string) => {
    if (content.includes('🔴') || content.includes('HOOG RISICO')) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else if (content.includes('🟡') || content.includes('LET OP')) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    } else if (content.includes('🟢') || content.includes('VEILIG')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return null;
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
                {message.role === 'assistant' && !message.isError && getRiskIcon(message.content) && (
                  <div className="flex items-center gap-2 mb-2">
                    {getRiskIcon(message.content)}
                  </div>
                )}
                <div className="text-sm whitespace-pre-line">
                  {message.content.split('\n').map((line, i) => {
                    // Simple markdown-like formatting
                    let formattedLine = line;
                    
                    // Bold text
                    formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    // Italic text
                    formattedLine = formattedLine.replace(/_(.*?)_/g, '<em>$1</em>');
                    
                    return (
                      <span 
                        key={i} 
                        dangerouslySetInnerHTML={{ __html: formattedLine + (i < message.content.split('\n').length - 1 ? '<br/>' : '') }} 
                      />
                    );
                  })}
                </div>
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
