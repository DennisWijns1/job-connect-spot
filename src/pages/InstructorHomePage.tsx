import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { InstructorBottomNav } from '@/components/InstructorBottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  Plus,
  Clock,
  Eye,
  Edit,
  Pause,
  CheckCircle,
  Shield,
  Briefcase,
  UserCircle,
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
  category: string;
  level: string;
  price: number;
  status: string;
  total_enrollments: number;
  average_rating: number;
  created_at: string;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-success text-success-foreground">Gepubliceerd</Badge>;
      case 'draft':
        return <Badge variant="secondary">Concept</Badge>;
      case 'in_review':
        return <Badge className="bg-accent text-accent-foreground">In Review</Badge>;
      case 'paused':
        return <Badge variant="outline">Gepauzeerd</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Beginner':
        return <Badge className="bg-success/20 text-success border-success/30">Beginner</Badge>;
      case 'Gevorderd':
        return <Badge className="bg-accent/20 text-accent-foreground border-accent/30">Gevorderd</Badge>;
      case 'Expert':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Expert</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
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

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Lessen</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalLessons}</p>
          <p className="text-xs text-muted-foreground">{stats.publishedLessons} gepubliceerd</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Deelnemers</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalEnrollments}</p>
          <p className="text-xs text-muted-foreground">totaal ingeschreven</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Inkomsten</span>
          </div>
          <p className="text-2xl font-bold text-foreground">€{stats.totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">totaal verdiend</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Rating</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">gemiddelde score</p>
        </div>
      </div>

      {/* Lesson Status Overview */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Status overzicht</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm">Gepubliceerd</span>
            </div>
            <span className="font-medium">{stats.publishedLessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <span className="text-sm">Concept</span>
            </div>
            <span className="font-medium">{stats.draftLessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm">In review</span>
            </div>
            <span className="font-medium">{lessons.filter(l => l.status === 'in_review').length}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Button 
        onClick={() => navigate('/instructor/lesson/new')}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Nieuwe les aanmaken
      </Button>
    </motion.div>
  );

  const renderLessonsTab = () => (
    <motion.div
      key="lessons"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <Button 
        onClick={() => navigate('/instructor/lesson/new')}
        className="w-full h-12 rounded-2xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nieuwe les aanmaken
      </Button>

      {lessons.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Nog geen lessen</h3>
          <p className="text-sm text-muted-foreground">Maak je eerste les aan om te beginnen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{lesson.title}</h4>
                  <p className="text-sm text-muted-foreground">{lesson.category}</p>
                </div>
                {getStatusBadge(lesson.status)}
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                {getLevelBadge(lesson.level)}
                <span className="flex items-center gap-1">
                  <Euro className="w-3.5 h-3.5" />
                  €{lesson.price}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {lesson.total_enrollments}
                </span>
                {lesson.average_rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-accent" />
                    {lesson.average_rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Bewerken
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                {lesson.status === 'published' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => handleLessonStatusChange(lesson.id, 'paused')}
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </Button>
                ) : lesson.status === 'paused' || lesson.status === 'draft' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => handleLessonStatusChange(lesson.id, 'published')}
                  >
                    <Play className="w-3.5 h-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderEnrollmentsTab = () => (
    <motion.div
      key="enrollments"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {enrollments.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Nog geen inschrijvingen</h3>
          <p className="text-sm text-muted-foreground">Publiceer je lessen om deelnemers aan te trekken</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-card rounded-2xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{enrollment.lesson.title}</span>
                {enrollment.status === 'completed' ? (
                  <Badge className="bg-success text-success-foreground">Voltooid</Badge>
                ) : enrollment.status === 'in_progress' ? (
                  <Badge className="bg-accent text-accent-foreground">Bezig</Badge>
                ) : (
                  <Badge variant="secondary">Ingeschreven</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Voortgang: {enrollment.progress_percentage}%</span>
                <span>Ingeschreven: {new Date(enrollment.enrolled_at).toLocaleDateString('nl-BE')}</span>
              </div>
              {enrollment.progress_percentage > 0 && (
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${enrollment.progress_percentage}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderReviewsTab = () => (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Average Rating Card */}
      <div className="bg-card rounded-2xl p-5 border border-border text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              className={`w-6 h-6 ${star <= Math.round(stats.averageRating) ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
            />
          ))}
        </div>
        <p className="text-3xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
        <p className="text-sm text-muted-foreground">Gemiddelde rating ({reviews.length} reviews)</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Nog geen reviews</h3>
          <p className="text-sm text-muted-foreground">Reviews verschijnen hier wanneer deelnemers je lessen beoordelen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-2xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{review.lesson.title}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground mb-2">"{review.comment}"</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('nl-BE')}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderProfileTab = () => (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
            {instructor?.avatar_url ? (
              <img src={instructor.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{instructor?.full_name}</h3>
            <p className="text-sm text-muted-foreground">{instructor?.email}</p>
          </div>
        </div>

        {instructor?.bio && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
            <p className="text-foreground">{instructor.bio}</p>
          </div>
        )}

        {instructor?.expertise && instructor.expertise.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {instructor.expertise.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {instructor?.years_experience && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{instructor.years_experience} jaar ervaring</span>
          </div>
        )}
      </div>

      {/* Verification Status */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Verificatie status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${instructor?.identity_verified ? 'bg-success/10' : 'bg-muted'}`}>
                <Shield className={`w-5 h-5 ${instructor?.identity_verified ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-foreground">Identiteit</p>
                <p className="text-xs text-muted-foreground">ID verificatie</p>
              </div>
            </div>
            {instructor?.identity_verified ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <Badge variant="outline">Niet geverifieerd</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${instructor?.diploma_verified ? 'bg-success/10' : 'bg-muted'}`}>
                <Award className={`w-5 h-5 ${instructor?.diploma_verified ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-foreground">Diploma</p>
                <p className="text-xs text-muted-foreground">Opleiding geverifieerd</p>
              </div>
            </div>
            {instructor?.diploma_verified ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <Badge variant="outline">Niet geverifieerd</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${instructor?.experience_verified ? 'bg-success/10' : 'bg-muted'}`}>
                <Briefcase className={`w-5 h-5 ${instructor?.experience_verified ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-foreground">Ervaring</p>
                <p className="text-xs text-muted-foreground">Werkervaring bevestigd</p>
              </div>
            </div>
            {instructor?.experience_verified ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <Badge variant="outline">Niet geverifieerd</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <Button 
        variant="outline" 
        className="w-full h-12 rounded-2xl"
        onClick={() => navigate('/instructor/register')}
      >
        <Edit className="w-4 h-4 mr-2" />
        Profiel bewerken
      </Button>
    </motion.div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'lessons':
        return renderLessonsTab();
      case 'enrollments':
        return renderEnrollmentsTab();
      case 'reviews':
        return renderReviewsTab();
      case 'profile':
        return renderProfileTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Lesgever Dashboard" showBack />

      <div className="px-4 py-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary/90 to-accent/80 rounded-3xl p-6 text-primary-foreground mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              {instructor?.avatar_url ? (
                <img src={instructor.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <UserCircle className="w-10 h-10" />
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
