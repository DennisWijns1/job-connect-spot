import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InstructorHeader } from '@/components/instructor/InstructorHeader';
import { InstructorBottomNav } from '@/components/InstructorBottomNav';
import { OverviewTab } from '@/components/instructor/OverviewTab';
import { LessonsTab } from '@/components/instructor/LessonsTab';
import { ParticipantsTab } from '@/components/instructor/ParticipantsTab';
import { ReviewsTab } from '@/components/instructor/ReviewsTab';
import { ProfileTab } from '@/components/instructor/ProfileTab';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Upload,
  BookOpen,
  Users,
  Euro,
  Award,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

interface Instructor {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  expertise: string[];
  years_experience: number;
  verification_status: string;
  identity_verified: boolean;
  diploma_verified: boolean;
  experience_verified: boolean;
  total_students: number;
  total_revenue: number;
  average_rating: number;
}

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  level: string | null;
  price: number;
  status: string | null;
  total_enrollments: number | null;
  average_rating: number | null;
  created_at: string;
  duration_hours?: number | null;
  lesson_type?: string | null;
  modules?: unknown;
  extras?: string;
}

interface Enrollment {
  id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  lesson: {
    title: string;
  };
  user_id: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  lesson: {
    title: string;
  };
}

const InstructorHomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInstructorStatus();
  }, []);

  const checkInstructorStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsRegistered(false);
      setLoading(false);
      return;
    }

    const { data: instructorData, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !instructorData) {
      setIsRegistered(false);
      setLoading(false);
      return;
    }

    setIsRegistered(true);
    setInstructor(instructorData);
    await fetchLessons(instructorData.id);
    await fetchEnrollments(instructorData.id);
    await fetchReviews(instructorData.id);
    setLoading(false);
  };

  const fetchLessons = async (instructorId: string) => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });
    
    if (data) setLessons(data);
  };

  const fetchEnrollments = async (instructorId: string) => {
    const { data } = await supabase
      .from('lesson_enrollments')
      .select(`
        *,
        lesson:lessons!inner(title, instructor_id)
      `)
      .eq('lesson.instructor_id', instructorId)
      .order('enrolled_at', { ascending: false });
    
    if (data) setEnrollments(data as unknown as Enrollment[]);
  };

  const fetchReviews = async (instructorId: string) => {
    const { data } = await supabase
      .from('lesson_reviews')
      .select(`
        *,
        lesson:lessons!inner(title, instructor_id)
      `)
      .eq('lesson.instructor_id', instructorId)
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data as unknown as Review[]);
  };

  const handleLessonStatusChange = async (lessonId: string, newStatus: string) => {
    const { error } = await supabase
      .from('lessons')
      .update({ status: newStatus })
      .eq('id', lessonId);

    if (error) {
      toast.error('Kon status niet wijzigen');
    } else {
      toast.success(`Les ${newStatus === 'published' ? 'gepubliceerd' : newStatus === 'paused' ? 'gepauzeerd' : 'bijgewerkt'}`);
      if (instructor) fetchLessons(instructor.id);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not registered - show onboarding
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <InstructorHeader title="Lesgever Portaal" />

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
                <h2 className="font-display font-bold text-xl mb-1">Word Lesgever</h2>
                <p className="text-sm opacity-90">Deel je expertise en verdien geld met je kennis</p>
              </div>
            </div>
          </motion.div>

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
              className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-button"
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
                <span className="text-sm text-foreground">Registreer en upload je diploma</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm text-foreground">AI verifieert je diploma automatisch</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-sm text-foreground">Maak en publiceer je lessen</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                <span className="text-sm text-foreground">Begin met verdienen!</span>
              </div>
            </div>
          </motion.div>
        </div>

        <InstructorBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Registered instructor - show dashboard with tabs
  const stats = {
    totalLessons: lessons.length,
    publishedLessons: lessons.filter(l => l.status === 'published').length,
    draftLessons: lessons.filter(l => l.status === 'draft').length,
    totalEnrollments: instructor?.total_students || 0,
    totalRevenue: instructor?.total_revenue || 0,
    averageRating: instructor?.average_rating || 0,
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} lessons={lessons} />;
      case 'lessons':
        return <LessonsTab lessons={lessons} onStatusChange={handleLessonStatusChange} />;
      case 'enrollments':
        return <ParticipantsTab enrollments={enrollments} />;
      case 'reviews':
        return <ReviewsTab reviews={reviews} averageRating={stats.averageRating} />;
      case 'profile':
        return <ProfileTab instructor={instructor} />;
      default:
        return <OverviewTab stats={stats} lessons={lessons} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <InstructorHeader title="Lesgever Dashboard" showBack />

      <div className="px-4 py-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary/90 to-accent/60 rounded-3xl p-6 text-primary-foreground mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
              {instructor?.avatar_url ? (
                <img src={instructor.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">
                Welkom, {instructor?.full_name}
              </h2>
              <p className="text-sm opacity-90">Beheer je lessen en volg je voortgang</p>
            </div>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {renderActiveTab()}
        </AnimatePresence>
      </div>

      <InstructorBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default InstructorHomePage;
