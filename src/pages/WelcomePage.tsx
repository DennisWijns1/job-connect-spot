import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hammer, Wrench, Search, ArrowRight } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'handy' | 'seeker' | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      navigate('/login', { state: { userType: selectedType } });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-lg">
            <Hammer className="w-12 h-12 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="font-display font-extrabold text-4xl text-foreground mb-3">
            Handy<span className="text-accent">Match</span>
          </h1>
          <p className="text-secondary text-lg max-w-xs mx-auto">
            Vind de juiste hulp in je buurt, of bied je vaardigheden aan
          </p>
        </motion.div>

        {/* Selection Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm space-y-4"
        >
          {/* Handy Card */}
          <button
            onClick={() => setSelectedType('handy')}
            className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedType === 'handy'
                ? 'border-primary bg-primary/5 shadow-card'
                : 'border-border bg-card hover:border-primary/50 hover:shadow-soft'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                selectedType === 'handy' ? 'bg-primary' : 'bg-primary/10'
              }`}>
                <Wrench className={`w-7 h-7 ${selectedType === 'handy' ? 'text-primary-foreground' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  Ik ben een Handy
                </h3>
                <p className="text-secondary text-sm">
                  Ik wil mijn vaardigheden aanbieden en klussen uitvoeren
                </p>
              </div>
            </div>
          </button>

          {/* Seeker Card */}
          <button
            onClick={() => setSelectedType('seeker')}
            className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedType === 'seeker'
                ? 'border-primary bg-primary/5 shadow-card'
                : 'border-border bg-card hover:border-primary/50 hover:shadow-soft'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                selectedType === 'seeker' ? 'bg-accent' : 'bg-accent/10'
              }`}>
                <Search className={`w-7 h-7 ${selectedType === 'seeker' ? 'text-accent-foreground' : 'text-accent'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  Ik zoek een Handy
                </h3>
                <p className="text-secondary text-sm">
                  Ik heb hulp nodig bij een klus of project
                </p>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-6 safe-area-bottom"
      >
        <button
          onClick={handleContinue}
          disabled={!selectedType}
          className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            selectedType
              ? 'btn-cta'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Aan de slag
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
