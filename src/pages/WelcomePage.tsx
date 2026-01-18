import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hammer, Wrench, Search, GraduationCap } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleSelect = (type: 'handy' | 'seeker' | 'instructor') => {
    // Check if already logged in - if so, just update type and go to swipe
    const isLoggedIn = localStorage.getItem('handymatch_user');
    if (isLoggedIn) {
      localStorage.setItem('handymatch_userType', type);
      navigate('/swipe');
    } else {
      navigate('/login', { state: { userType: type } });
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
          <div className="w-24 h-24 rounded-[24px] bg-secondary flex items-center justify-center shadow-lg ring-4 ring-secondary/30">
            <Hammer className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="font-display font-extrabold text-4xl mb-3">
            <span className="text-primary">Handy</span><span className="text-secondary">Match</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
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
          {/* Seeker Card - Accent with sand highlight */}
          <button
            onClick={() => handleSelect('seeker')}
            className="w-full p-5 rounded-[20px] border-2 border-border bg-card hover:border-accent hover:shadow-card-hover transition-all duration-300 text-left group card-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center transition-all duration-300 bg-accent/15 group-hover:bg-accent">
                <Search className="w-7 h-7 transition-colors text-accent group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-primary mb-1">
                  Ik zoek een Handy
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ik heb hulp nodig bij een klus of project
                </p>
              </div>
            </div>
          </button>

          {/* Handy Card - Primary blue */}
          <button
            onClick={() => handleSelect('handy')}
            className="w-full p-5 rounded-[20px] border-2 border-border bg-card hover:border-primary hover:shadow-card-hover transition-all duration-300 text-left group card-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center transition-all duration-300 bg-primary/10 group-hover:bg-primary">
                <Wrench className="w-7 h-7 transition-colors text-primary group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-primary mb-1">
                  Ik ben een Handy
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ik wil mijn vaardigheden aanbieden en klussen uitvoeren
                </p>
              </div>
            </div>
          </button>

          {/* Instructor Card - Secondary/sand accent */}
          <button
            onClick={() => handleSelect('instructor')}
            className="w-full p-5 rounded-[20px] border-2 border-border bg-card hover:border-secondary hover:shadow-card-hover transition-all duration-300 text-left group card-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center transition-all duration-300 bg-secondary/20 group-hover:bg-secondary">
                <GraduationCap className="w-7 h-7 transition-colors text-primary group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-primary mb-1">
                  Ik ben een Lesgever
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ik wil mijn kennis delen en anderen opleiden
                </p>
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;