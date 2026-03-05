import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CheckCircle, Star, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { HammerRating } from '@/components/HammerRating';

const completedProjects = [
  {
    id: '1',
    title: 'Stopcontact vervangen in keuken',
    client: 'Sophie Maes',
    location: 'Leuven Centrum',
    completedAt: '28 feb 2026',
    rating: 5,
    review: 'Uitstekend werk! Snel en netjes afgewerkt. Zeker een aanrader.',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    category: 'Elektriciteit',
    earnings: 105,
  },
  {
    id: '2',
    title: 'Zekeringskast gecontroleerd',
    client: 'Marc Willems',
    location: 'Heverlee',
    completedAt: '22 feb 2026',
    rating: 4.5,
    review: 'Heel professioneel. Heeft alles goed uitgelegd.',
    photo: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
    category: 'Elektriciteit',
    earnings: 140,
  },
  {
    id: '3',
    title: 'Domotica installatie woonkamer',
    client: 'Anna De Vries',
    location: 'Kessel-Lo',
    completedAt: '15 feb 2026',
    rating: 5,
    review: 'Fantastisch! Alles werkt perfect en hij nam de tijd om alles uit te leggen.',
    photo: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop',
    category: 'Domotica',
    earnings: 280,
  },
  {
    id: '4',
    title: 'Verlichting badkamer geïnstalleerd',
    client: 'Koen Peeters',
    location: 'Leuven',
    completedAt: '8 feb 2026',
    rating: 4,
    review: 'Goed werk, was alleen iets later dan afgesproken.',
    photo: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
    category: 'Elektriciteit',
    earnings: 95,
  },
  {
    id: '5',
    title: 'Laadpaal installatie garage',
    client: 'Lisa Janssen',
    location: 'Wijgmaal',
    completedAt: '1 feb 2026',
    rating: 5,
    review: 'Top vakman! Snelle service en perfecte installatie.',
    photo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop',
    category: 'Elektriciteit',
    earnings: 450,
  },
];

const CompletedProjectsPage = () => {
  const totalEarnings = completedProjects.reduce((sum, p) => sum + p.earnings, 0);
  const avgRating = completedProjects.reduce((sum, p) => sum + p.rating, 0) / completedProjects.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Afgewerkte projecten" showBack />

      <div className="px-4 py-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-primary">{completedProjects.length}</p>
            <p className="text-xs text-muted-foreground">Projecten</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-accent">€{totalEarnings}</p>
            <p className="text-xs text-muted-foreground">Verdiend</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-accent" fill="currentColor" />
              <span className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Gemiddeld</p>
          </div>
        </motion.div>

        {/* Project list */}
        <h3 className="font-bold text-foreground mb-4">Recente projecten</h3>
        <div className="space-y-4">
          {completedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-soft"
            >
              <div className="flex gap-4 p-4">
                <img
                  src={project.photo}
                  alt={project.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-foreground text-sm truncate pr-2">{project.title}</h4>
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{project.client}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {project.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {project.completedAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <HammerRating rating={project.rating} size="sm" />
                    <span className="text-sm font-bold text-accent">€{project.earnings}</span>
                  </div>
                </div>
              </div>
              {project.review && (
                <div className="px-4 pb-4">
                  <div className="bg-background rounded-xl p-3">
                    <p className="text-xs text-muted-foreground italic">"{project.review}"</p>
                    <p className="text-xs text-foreground font-medium mt-1">— {project.client}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CompletedProjectsPage;
