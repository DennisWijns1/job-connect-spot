import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Upload,
  BookOpen,
  Users,
  Euro,
  Star,
  ChevronRight,
  Award,
  TrendingUp,
  Play,
  GraduationCap,
} from 'lucide-react';

const InstructorHomePage = () => {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [instructorStats, setInstructorStats] = useState({
    totalLessons: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    checkInstructorStatus();
  }, []);

  const checkInstructorStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsRegistered(false);
      return;
    }

    const { data: instructor } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (instructor) {
      setIsRegistered(true);
      
      // Fetch stats
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('instructor_id', instructor.id);

      setInstructorStats({
        totalLessons: lessons?.length || 0,
        totalStudents: instructor.total_students || 0,
        totalRevenue: instructor.total_revenue || 0,
        averageRating: instructor.average_rating || 0,
      });
    } else {
      setIsRegistered(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Lesgever Portaal" />

      <div className="px-4 py-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary/90 to-accent/80 rounded-3xl p-6 text-primary-foreground mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-1">
                {isRegistered ? 'Welkom terug!' : 'Word Lesgever'}
              </h2>
              <p className="text-sm opacity-90">
                {isRegistered 
                  ? 'Beheer je lessen en bekijk je statistieken'
                  : 'Deel je expertise en verdien geld met je kennis'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {isRegistered === false && (
          <>
            {/* CTA: Zet je les online */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border mb-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">Zet je les online</h3>
                  <p className="text-sm text-muted-foreground">
                    Maak een account aan en begin met lesgeven
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/instructor/register')}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent"
              >
                Start nu
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3 mb-6"
            >
              <h3 className="font-bold text-foreground">Waarom lesgeven op HandyMatch?</h3>
              
              <div className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Euro className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Verdien geld</h4>
                  <p className="text-sm text-muted-foreground">Bepaal zelf je prijzen en verdien passief inkomen</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Bereik duizenden</h4>
                  <p className="text-sm text-muted-foreground">Onze community groeit elke dag met nieuwe leerlingen</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Bouw je reputatie</h4>
                  <p className="text-sm text-muted-foreground">Word een erkende expert in jouw vakgebied</p>
                </div>
              </div>
            </motion.div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-secondary rounded-2xl p-5"
            >
              <h3 className="font-bold text-foreground mb-4">Hoe werkt het?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm">Registreer en upload je diploma</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm">AI verifieert je diploma automatisch</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-sm">Maak en publiceer je lessen</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                  <span className="text-sm">Begin met verdienen!</span>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isRegistered === true && (
          <>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Lessen</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{instructorStats.totalLessons}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Studenten</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{instructorStats.totalStudents}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Inkomsten</span>
                </div>
                <p className="text-2xl font-bold text-foreground">€{instructorStats.totalRevenue}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Rating</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{instructorStats.averageRating.toFixed(1)}</p>
              </div>
            </motion.div>

            {/* CTA: Nieuwe les */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border mb-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">Zet je les online</h3>
                  <p className="text-sm text-muted-foreground">
                    Maak een nieuwe les aan en bereik meer studenten
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/instructor/lesson/new')}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent"
              >
                Nieuwe les maken
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-foreground">Dashboard</h4>
                  <p className="text-sm text-muted-foreground">Bekijk statistieken en beheer lessen</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-foreground">Mijn lessen</h4>
                  <p className="text-sm text-muted-foreground">Bewerk en bekijk je gepubliceerde lessen</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </motion.div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default InstructorHomePage;
