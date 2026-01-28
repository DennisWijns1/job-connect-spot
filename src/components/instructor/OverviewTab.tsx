import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Euro, 
  Star, 
  Plus, 
  TrendingUp,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  totalLessons: number;
  publishedLessons: number;
  draftLessons: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageRating: number;
}

interface Lesson {
  id: string;
  title: string;
  status: string | null;
  total_enrollments: number | null;
}

interface OverviewTabProps {
  stats: Stats;
  lessons: Lesson[];
}

export const OverviewTab = ({ stats, lessons }: OverviewTabProps) => {
  const navigate = useNavigate();

  const inReviewCount = lessons.filter(l => l.status === 'in_review').length;

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalLessons}</p>
          <p className="text-sm text-muted-foreground">Lessen</p>
          <p className="text-xs text-success mt-1">{stats.publishedLessons} gepubliceerd</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalEnrollments}</p>
          <p className="text-sm text-muted-foreground">Deelnemers</p>
          <p className="text-xs text-muted-foreground mt-1">totaal ingeschreven</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Euro className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">€{stats.totalRevenue.toFixed(0)}</p>
          <p className="text-sm text-muted-foreground">Inkomsten</p>
          <p className="text-xs text-muted-foreground mt-1">totaal verdiend</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">Rating</p>
          <p className="text-xs text-accent mt-1">gemiddelde score</p>
        </div>
      </div>

      {/* Lesson Status Overview */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Status overzicht</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-foreground">Gepubliceerd</span>
            </div>
            <span className="font-semibold text-foreground">{stats.publishedLessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <span className="text-sm text-foreground">Concept</span>
            </div>
            <span className="font-semibold text-foreground">{stats.draftLessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-foreground">In review</span>
            </div>
            <span className="font-semibold text-foreground">{inReviewCount}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-3">Snelle acties</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline"
            className="h-12 rounded-xl justify-start"
            onClick={() => navigate('/instructor/lesson/new')}
          >
            <Plus className="w-4 h-4 mr-2 text-accent" />
            Nieuwe les
          </Button>
          <Button 
            variant="outline"
            className="h-12 rounded-xl justify-start"
          >
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            Planning
          </Button>
        </div>
      </div>

      {/* CTA Button */}
      <Button 
        onClick={() => navigate('/instructor/lesson/new')}
        className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg shadow-button"
      >
        <Plus className="w-5 h-5 mr-2" />
        Nieuwe les aanmaken
      </Button>
    </motion.div>
  );
};
