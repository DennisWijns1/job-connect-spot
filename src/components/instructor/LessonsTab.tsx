import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Euro, 
  Users, 
  Star, 
  Clock, 
  MapPin, 
  Monitor,
  Edit,
  Eye,
  Play,
  Pause,
  Package,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface LessonsTabProps {
  lessons: Lesson[];
  onStatusChange: (lessonId: string, newStatus: string) => void;
}

export const LessonsTab = ({ lessons, onStatusChange }: LessonsTabProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string | null) => {
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
        return <Badge variant="outline">{status || 'Onbekend'}</Badge>;
    }
  };

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case 'Beginner':
        return <Badge className="bg-success/20 text-success border-success/30">Beginner</Badge>;
      case 'Gevorderd':
        return <Badge className="bg-accent/20 text-accent border-accent/30">Gevorderd</Badge>;
      case 'Expert':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Expert</Badge>;
      default:
        return <Badge variant="outline">{level || 'Onbekend'}</Badge>;
    }
  };

  return (
    <motion.div
      key="lessons"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <Button 
        onClick={() => navigate('/instructor/lesson/new')}
        className="w-full h-12 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground"
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
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card transition-shadow"
            >
              {/* Lesson Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">{lesson.category}</p>
                  </div>
                  {getStatusBadge(lesson.status)}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  {/* Lesson Type Badge */}
                  <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-lg">
                    {lesson.lesson_type === 'online' ? (
                      <Monitor className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                    )}
                    {lesson.lesson_type === 'online' ? 'Online' : 'Fysiek'}
                  </span>

                  {getLevelBadge(lesson.level)}
                  
                  {lesson.duration_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.duration_hours}u
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Euro className="w-3.5 h-3.5" />
                    €{lesson.price}
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {lesson.total_enrollments || 0}
                  </span>
                  
                  {(lesson.average_rating || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      {(lesson.average_rating || 0).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Lesson Description */}
              {lesson.description && (
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                  </div>
                </div>
              )}

              {/* Materials Info */}
              {lesson.extras && (
                <div className="px-4 py-3 border-b border-border bg-secondary/30">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Benodigdheden</p>
                      <p className="text-sm text-foreground">{lesson.extras}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-3 flex gap-2">
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
                    onClick={() => onStatusChange(lesson.id, 'paused')}
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </Button>
                ) : lesson.status === 'paused' || lesson.status === 'draft' ? (
                  <Button 
                    size="sm" 
                    className="rounded-xl bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => onStatusChange(lesson.id, 'published')}
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
};
