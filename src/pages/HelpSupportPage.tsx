import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  AlertTriangle,
  Wrench,
  CreditCard,
  ShieldAlert,
  XCircle,
  ExternalLink,
} from 'lucide-react';

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      id: 'payments',
      icon: CreditCard,
      question: 'Hoe werken betalingen?',
      answer: 'Betalingen gebeuren rechtstreeks tussen jou en de Handy via QR-code of IBAN. HandyMatch faciliteert enkel het contact. Spreek duidelijke afspraken af voordat het werk begint.',
    },
    {
      id: 'liability',
      icon: ShieldAlert,
      question: 'Wie is aansprakelijk bij schade?',
      answer: 'De Handy is verantwoordelijk voor de kwaliteit van het geleverde werk. HandyMatch is een bemiddelingsplatform en draagt geen aansprakelijkheid voor de uitvoering. Controleer altijd de reviews en verificatiestatus.',
    },
    {
      id: 'cancellation',
      icon: XCircle,
      question: 'Kan ik een afspraak annuleren?',
      answer: 'Ja, via de chat kun je een afspraak annuleren. Doe dit minimaal 24 uur van tevoren uit respect voor de Handy. Herhaaldelijke last-minute annuleringen kunnen je account beïnvloeden.',
    },
    {
      id: 'verification',
      icon: ShieldAlert,
      question: 'Wat betekent "Geverifieerd"?',
      answer: 'Geverifieerde Handy\'s hebben hun identiteit en/of diploma\'s laten controleren door ons team. Dit biedt extra zekerheid over hun betrouwbaarheid en vakkennis.',
    },
    {
      id: 'pricing',
      icon: CreditCard,
      question: 'Hoe worden prijzen bepaald?',
      answer: 'Handy\'s bepalen zelf hun uurtarief of offerte. Je kunt filteren op budget en altijd vooraf een prijsafspraak maken. Vergelijk meerdere Handy\'s voor de beste deal.',
    },
  ];

  const filteredFaqs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Klantenservice" />

      <div className="px-4 py-6">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Zoek in veelgestelde vragen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-card border-border"
          />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="font-display font-bold text-lg text-foreground mb-4">
            Veelgestelde Vragen
          </h2>
          <div className="bg-card rounded-3xl shadow-card overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className={index !== filteredFaqs.length - 1 ? 'border-b border-border' : 'border-0'}
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-background/50">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="pl-13 ml-13">
                      <p className="text-muted-foreground text-sm leading-relaxed pl-[52px]">
                        {item.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Geen resultaten gevonden</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-display font-bold text-lg text-foreground mb-4">
            Contact & Meldingen
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/report-abuse')}
              className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Meld Misbruik</p>
                <p className="text-xs text-muted-foreground mt-1">Rapporteer wangedrag</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/technical-support')}
              className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wrench className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Technische Hulp</p>
                <p className="text-xs text-muted-foreground mt-1">App problemen</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Footer Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 px-4"
        >
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            HandyMatch is een portaal en is niet aansprakelijk voor de uitvoering van werken door derden.{' '}
            <button
              onClick={() => navigate('/terms')}
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Lees onze Algemene Voorwaarden
              <ExternalLink className="w-3 h-3" />
            </button>
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HelpSupportPage;
