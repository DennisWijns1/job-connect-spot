import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { BookOpen, Play, Star, Clock, Award, ChevronRight, GraduationCap, Upload, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    certifiable: true,
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
    certifiable: true,
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
    certifiable: true,
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
    certifiable: true,
  },
];

const LearningPage = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';
  const isInstructor = userType === 'instructor';

  const levels = ['Beginner', 'Gevorderd', 'Expert'];

  const filteredCourses = selectedLevel
    ? courses.filter(c => c.level === selectedLevel)
    : courses;

  const handleEnroll = (courseTitle: string) => {
    toast.success(`Ingeschreven voor "${courseTitle}"!`, {
      description: 'Ga naar je profiel om de cursus te starten',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Lessen" showBack />

      <div className="px-4 py-6">
        {/* Intro Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl p-6 text-primary-foreground mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-1">
                {isHandy ? 'Word Gecertificeerd' : 'Volg Privélessen'}
              </h2>
              <p className="text-sm opacity-90">
                {isHandy 
                  ? 'Volg lessenreeksen van professionals en verdien een certificatie badge op je profiel'
                  : 'Leer van geverifieerde experts en word een betere klusser'
                }
              </p>
            </div>
          </div>

          {isHandy && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-foreground/20">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Certificatie = meer klanten!</span>
            </div>
          )}
        </motion.div>

        {/* Level Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge
            variant={selectedLevel === null ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 whitespace-nowrap transition-all hover:scale-105"
            onClick={() => setSelectedLevel(null)}
          >
            Alles
          </Badge>
          {levels.map((level) => (
            <Badge
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 whitespace-nowrap transition-all hover:scale-105"
              onClick={() => setSelectedLevel(level)}
            >
              {level}
            </Badge>
          ))}
        </div>

        {/* Courses */}
        <div className="space-y-4">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border hover:shadow-card hover:border-primary/20 transition-all group"
            >
              <div className="flex">
                {/* Image */}
                <div className="w-28 h-28 flex-shrink-0 relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 group-hover:bg-foreground/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {course.certifiable && (
                    <div className="absolute top-2 left-2 bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Certificaat
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground pr-2 group-hover:text-primary transition-colors">
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

                <button 
                  onClick={() => handleEnroll(course.title)}
                  className="flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Become Instructor */}
        {!isInstructor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-success/10 to-success/5 rounded-2xl p-5 border border-success/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Word Lesgever</h3>
                <p className="text-sm text-muted-foreground">
                  Deel je kennis en verdien bij. Upload je diploma om te starten.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-success text-success hover:bg-success hover:text-success-foreground"
                onClick={() => toast.info('Upload functie komt binnenkort!')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Start
              </Button>
            </div>
          </motion.div>
        )}

        {/* Instructor Section */}
        {isInstructor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 space-y-4"
          >
            <h3 className="font-display font-bold text-lg text-foreground">Jouw Lessen</h3>
            
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Maak een nieuwe les</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload je diploma om te starten
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                onClick={() => toast.info('Les aanmaken komt binnenkort!')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Diploma & Start
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LearningPage;