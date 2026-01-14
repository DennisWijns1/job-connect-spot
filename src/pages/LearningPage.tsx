import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { BookOpen, Play, Star, Clock, Award, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const courses = [
  {
    id: '1',
    title: 'Basis Elektriciteit',
    instructor: 'Jan Vermeeren',
    instructorVerified: true,
    rating: 4.9,
    students: 1250,
    duration: '4 uur',
    price: 29,
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
    level: 'Beginner',
  },
  {
    id: '2',
    title: 'Loodgieterij voor Beginners',
    instructor: 'Marie De Vos',
    instructorVerified: true,
    rating: 4.7,
    students: 890,
    duration: '3.5 uur',
    price: 24,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400305e979?w=600&h=400&fit=crop',
    level: 'Beginner',
  },
  {
    id: '3',
    title: 'Tegelen als een Pro',
    instructor: 'Tom Janssen',
    instructorVerified: true,
    rating: 4.8,
    students: 650,
    duration: '5 uur',
    price: 34,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
    level: 'Gevorderd',
  },
  {
    id: '4',
    title: 'Domotica Installeren',
    instructor: 'Pieter Claes',
    instructorVerified: true,
    rating: 4.6,
    students: 420,
    duration: '6 uur',
    price: 49,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop',
    level: 'Expert',
  },
];

const LearningPage = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const levels = ['Beginner', 'Gevorderd', 'Expert'];

  const filteredCourses = selectedLevel
    ? courses.filter(c => c.level === selectedLevel)
    : courses;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Leren" showBack />

      <div className="px-4 py-6">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-1">
                Leer nieuwe vaardigheden
              </h2>
              <p className="text-sm opacity-90">
                Volg online lessen van geverifieerde professionals en word een betere Handy
              </p>
            </div>
          </div>
        </motion.div>

        {/* Level Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge
            variant={selectedLevel === null ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 whitespace-nowrap"
            onClick={() => setSelectedLevel(null)}
          >
            Alles
          </Badge>
          {levels.map((level) => (
            <Badge
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 whitespace-nowrap"
              onClick={() => setSelectedLevel(level)}
            >
              {level}
            </Badge>
          ))}
        </div>

        {/* Courses */}
        <div className="space-y-4">
          {filteredCourses.map((course, index) => (
            <motion.button
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toast.info('Cursus bekijken komt binnenkort!')}
              className="w-full bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all text-left"
            >
              <div className="flex">
                {/* Image */}
                <div className="w-28 h-28 flex-shrink-0 relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground pr-2">
                      {course.title}
                    </h3>
                    <Badge className="bg-accent/10 text-accent text-xs">
                      €{course.price}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <span>{course.instructor}</span>
                    {course.instructorVerified && (
                      <Award className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-accent" fill="currentColor" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.duration}</span>
                    </div>
                    <Badge variant="outline" className="text-xs py-0">
                      {course.level}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center pr-4">
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Become Instructor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-card rounded-2xl p-5 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Word instructeur</h3>
              <p className="text-sm text-muted-foreground">
                Deel je kennis en verdien bij
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LearningPage;
