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
  BookOpen,
  Users,
  Star,
  UserCircle,
  Plus,
  Euro,
  Clock,
  Eye,
  Edit,
  Pause,
  Play,
  CheckCircle,
  Award,
  Shield,
  Briefcase,
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

const InstructorDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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
      navigate('/instructor/register');
      return;
    }

    const { data: instructorData, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !instructorData) {
      navigate('/instructor/register');
      return;
    }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
            {instructor?.avatar_url ? (
              <img src={instructor.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-10 h-10 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">{instructor?.full_name}</h3>
            <p className="text-sm text-muted-foreground">{instructor?.email}</p>
          </div>
        </div>
        {instructor?.bio && (
          <p className="text-sm text-muted-foreground mb-4">{instructor.bio}</p>
        )}
        {instructor?.expertise && instructor.expertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {instructor.expertise.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        )}
        {instructor?.years_experience && instructor.years_experience > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{instructor.years_experience} jaar ervaring</span>
          </div>
        )}
      </div>

      {/* Verification Status */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Verificatie status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Identiteit</span>
            </div>
            {instructor?.identity_verified ? (
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                Geverifieerd
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                In afwachting
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Diploma</span>
            </div>
            {instructor?.diploma_verified ? (
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                Geverifieerd
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                In afwachting
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Ervaring</span>
            </div>
            {instructor?.experience_verified ? (
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                Geverifieerd
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                In afwachting
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full rounded-2xl"
        onClick={() => toast.info('Profiel bewerken komt binnenkort!')}
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

export default InstructorDashboardPage;
