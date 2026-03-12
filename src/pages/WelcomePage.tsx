import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hammer, Wrench, Search, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSelect = (type: 'handy' | 'seeker' | 'instructor') => {
    localStorage.setItem('handymatch_userType', type);
    if (type === 'instructor') {
      navigate('/instructor');
      return;
    }
    navigate('/swipe');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher compact />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-[24px] gradient-teal flex items-center justify-center shadow-lg">
            <Hammer className="w-12 h-12 text-white" />
          </div>
        </motion.div>

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
            {t('welcome.tagline')}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm space-y-4"
        >
          <button
            onClick={() => handleSelect('seeker')}
            className="w-full p-5 rounded-[20px] border border-border bg-card hover:bg-primary/5 hover:shadow-card-hover hover:border-primary/30 transition-all duration-400 text-left group card-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center transition-all duration-300 bg-primary/10 group-hover:gradient-teal">
                <Search className="w-7 h-7 transition-colors text-primary group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  {t('welcome.seekerTitle')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('welcome.seekerDesc')}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('handy')}
            className="w-full p-5 rounded-[20px] border border-border bg-card hover:bg-accent/5 hover:shadow-card-hover hover:border-accent/30 transition-all duration-400 text-left group card-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center transition-all duration-300 bg-accent/15 group-hover:gradient-accent">
                <Wrench className="w-7 h-7 transition-colors text-accent group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  {t('welcome.handyTitle')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('welcome.handyDesc')}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('instructor')}
            className="w-full p-5 rounded-[20px] border border-border bg-card hover:bg-secondary hover:shadow-card-hover hover:border-success/40 transition-all duration-400 text-left group card-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center transition-all duration-300 bg-success/15 group-hover:bg-success">
                <GraduationCap className="w-7 h-7 transition-colors text-success group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  {t('welcome.instructorTitle')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('welcome.instructorDesc')}
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
