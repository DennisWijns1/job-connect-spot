import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Send, Camera, Bot, Wrench, Lightbulb, Droplets, Hammer } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedProblems = [
  { icon: Lightbulb, text: 'Lamp flikkert constant', category: 'Elektriciteit' },
  { icon: Droplets, text: 'Afvoer loopt niet door', category: 'Loodgieter' },
  { icon: Hammer, text: 'Tegel is gebarsten', category: 'Tegels' },
  { icon: Wrench, text: 'Kraan lekt water', category: 'Loodgieter' },
];

const AIHelpPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hallo! 👋 Ik ben je AI klushulp. Beschrijf je probleem of upload een foto, en ik help je met een oplossing. Als het te complex is, kan ik een Handy in de buurt voorstellen.',
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
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Ik begrijp het probleem! 🔧 Hier zijn enkele stappen die je kunt proberen:\n\n1. Controleer eerst of de stroom/water is afgesloten\n2. Inspecteer visueel of er duidelijke schade is\n3. Probeer de eenvoudigste oplossing eerst\n\nWil je dat ik een Handy in de buurt zoek om te helpen?`,
        `Dat is een veelvoorkomend probleem! 💡 Hier is wat je kunt doen:\n\n• Check of alle verbindingen stevig vastzitten\n• Kijk of er geen verstoppingen zijn\n• Probeer het apparaat/onderdeel te resetten\n\nAls dit niet werkt, kan ik je verbinden met een professional.`,
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Header title="AI Klushulp" showBack />

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
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mr-3 flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card shadow-soft rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
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
            <div className="bg-card shadow-soft rounded-2xl rounded-bl-sm p-4">
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
          <p className="text-sm text-muted-foreground mb-3">Veelvoorkomende problemen:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedProblems.map((problem, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestion(problem.text)}
                className="p-3 bg-card rounded-xl text-left hover:shadow-soft transition-all group"
              >
                <problem.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
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
          <button className="w-12 h-12 rounded-xl bg-card shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Camera className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Beschrijf je probleem..."
              className="h-12 rounded-xl pr-12 bg-card border-border"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
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
