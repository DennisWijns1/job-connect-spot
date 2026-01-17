import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hammer, Wrench, Search, GraduationCap } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  // Check if user is already logged in
  const isLoggedIn = localStorage.getItem('handymatch_user');
  if (isLoggedIn) {
    // Redirect to swipe page immediately
    navigate('/swipe', { replace: true });
    return null;
  }

  const handleSelect = (type: 'handy' | 'seeker' | 'instructor') => {
    // Navigate directly to login with the selected type
    navigate('/login', { state: { userType: type } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <Hammer className="w-12 h-12 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="font-display font-extrabold text-4xl text-foreground mb-3">
            Handy<span className="text-gradient">Match</span>
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
          className="w-full max-w-sm space-y-3"
        >
          {/* Seeker Card - FIRST */}
          <button
            onClick={() => handleSelect('seeker')}
            className="w-full p-5 rounded-2xl border-2 border-border bg-card hover:border-accent/50 hover:shadow-soft hover:bg-gradient-to-r hover:from-card hover:to-accent/5 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 bg-accent/10 group-hover:bg-gradient-to-br group-hover:from-accent/20 group-hover:to-accent/10">
                <Search className="w-7 h-7 transition-colors text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  Ik zoek een Handy
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ik heb hulp nodig bij een klus of project
                </p>
              </div>
            </div>
          </button>

          {/* Handy Card - SECOND */}
          <button
            onClick={() => handleSelect('handy')}
            className="w-full p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-soft hover:bg-gradient-to-r hover:from-card hover:to-primary/5 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 bg-primary/10 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-primary/10">
                <Wrench className="w-7 h-7 transition-colors text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  Ik ben een Handy
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ik wil mijn vaardigheden aanbieden en klussen uitvoeren
                </p>
              </div>
            </div>
          </button>

          {/* Instructor Card - THIRD */}
          <button
            onClick={() => handleSelect('instructor')}
            className="w-full p-5 rounded-2xl border-2 border-border bg-card hover:border-success/50 hover:shadow-soft hover:bg-gradient-to-r hover:from-card hover:to-success/5 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 bg-success/10 group-hover:bg-gradient-to-br group-hover:from-success/20 group-hover:to-success/10">
                <GraduationCap className="w-7 h-7 transition-colors text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
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