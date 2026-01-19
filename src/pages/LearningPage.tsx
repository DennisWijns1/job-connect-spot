import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { BookOpen, Play, Star, Clock, Award, ChevronRight, GraduationCap, Upload, CheckCircle, MapPin, Search, Filter, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LessonSeries {
  id: string;
  title: string;
  instructor: string;
  instructorVerified: boolean;
  rating: number;
  students: number;
  lessonsCount: number;
  totalDuration: string;
  price: number;
  image: string;
  level: 'Beginner' | 'Gevorderd' | 'Expert';
  location: string;
  specialty: string;
  hasDiploma: boolean;
  description: string;
}

const lessonSeries: LessonSeries[] = [
  {
    id: '1',
    title: 'Elektriciteit Basis tot Expert',
    instructor: 'Jan Vermeeren',
    instructorVerified: true,
    rating: 4.9,
    students: 1250,
    lessonsCount: 8,
    totalDuration: '24 uur',
    price: 249,
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
    level: 'Beginner',
    location: 'Leuven',
    specialty: 'Elektriciteit',
    hasDiploma: true,
    description: 'Complete opleiding van basis elektriciteit tot gevorderde installaties. Na afloop ontvang je het HandyMatch diploma elektriciteit.',
  },
  {
    id: '2',
    title: 'Loodgieterij Masterclass',
    instructor: 'Pieter Janssen',
    instructorVerified: true,
    rating: 4.8,
    students: 890,
    lessonsCount: 6,
    totalDuration: '18 uur',
    price: 199,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400305e979?w=600&h=400&fit=crop',
    level: 'Gevorderd',
    location: 'Brussel',
    specialty: 'Loodgieter',
    hasDiploma: true,
    description: 'Leer alle ins en outs van moderne loodgieterij. Van kleine reparaties tot complete badkamerrenovaties.',
  },
  {
    id: '3',
    title: 'Tegelen voor Beginners',
    instructor: 'Tom Willems',
    instructorVerified: true,
    rating: 4.7,
    students: 650,
    lessonsCount: 4,
    totalDuration: '12 uur',
    price: 129,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
    level: 'Beginner',
    location: 'Antwerpen',
    specialty: 'Tegels',
    hasDiploma: false,
    description: 'Ideale startcursus voor iedereen die wil leren tegelen. Praktijkgerichte lessen met veel oefening.',
  },
  {
    id: '4',
    title: 'Domotica & Smart Home',
    instructor: 'Pieter Claes',
    instructorVerified: true,
    rating: 4.6,
    students: 420,
    lessonsCount: 5,
    totalDuration: '15 uur',
    price: 179,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop',
    level: 'Expert',
    location: 'Gent',
    specialty: 'Elektriciteit',
    hasDiploma: true,
    description: 'Specialiseer je in smart home installaties en domotica. Zeer gevraagd in de huidige markt!',
  },
  {
    id: '5',
    title: 'Tuinonderhoud Seizoensgebonden',
    instructor: 'Marie De Vos',
    instructorVerified: true,
    rating: 4.5,
    students: 380,
    lessonsCount: 4,
    totalDuration: '8 uur',
    price: 89,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    level: 'Beginner',
    location: 'Leuven',
    specialty: 'Tuinwerk',
    hasDiploma: false,
    description: 'Leer hoe je een tuin het hele jaar door onderhoud. Perfect voor hobbyisten en bijverdieners.',
  },
  {
    id: '6',
    title: 'Professioneel Schilderen',
    instructor: 'Karel Van Damme',
    instructorVerified: true,
    rating: 4.8,
    students: 720,
    lessonsCount: 6,
    totalDuration: '18 uur',
    price: 159,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop',
    level: 'Gevorderd',
    location: 'Mechelen',
    specialty: 'Schilderen',
    hasDiploma: true,
    description: 'Van voorbereiding tot afwerking. Word een professioneel schilder met dit HandyMatch diploma.',
  },
];

const specialties = ['Elektriciteit', 'Loodgieter', 'Tuinwerk', 'Schilderen', 'Tegels', 'Timmerwerk'];
const locations = ['Leuven', 'Brussel', 'Antwerpen', 'Gent', 'Mechelen'];

const LearningPage = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';
  const isInstructor = userType === 'instructor';

  const levels = ['Beginner', 'Gevorderd', 'Expert'];

  const filteredSeries = lessonSeries.filter(series => {
    const matchesLevel = !selectedLevel || series.level === selectedLevel;
    const matchesSpecialty = !selectedSpecialty || series.specialty === selectedSpecialty;
    const matchesLocation = !selectedLocation || series.location === selectedLocation;
    const matchesSearch = !searchQuery || 
      series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLevel && matchesSpecialty && matchesLocation && matchesSearch;
  });

  const handleEnroll = (seriesTitle: string) => {
    toast.success(`Ingeschreven voor "${seriesTitle}"!`, {
      description: 'Je ontvangt een bevestigingsmail met de details',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Lessenreeksen" showBack />

      <div className="px-4 py-6">
        {/* Intro Banner */}
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
                {isHandy ? 'Word Geverifieerd Handy' : 'Leer van Experts'}
              </h2>
              <p className="text-sm opacity-90">
                {isHandy 
                  ? 'Volg lessenreeksen en behaal je HandyMatch diploma om geverifieerd te worden op de app'
                  : 'Ontdek lessenreeksen en leer nieuwe vaardigheden van geverifieerde experts'
                }
              </p>
            </div>
          </div>

          {isHandy && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
              <Award className="w-4 h-4" />
              <span className="text-sm">Diploma = geverifieerd badge + meer klanten!</span>
            </div>
          )}
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Zoek op titel, specialiteit of lesgever..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-border bg-card text-foreground"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-primary"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Verberg filters' : 'Toon filters'}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 space-y-4"
          >
            {/* Location Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Locatie
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedLocation === null ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-3"
                  onClick={() => setSelectedLocation(null)}
                >
                  Alle
                </Badge>
                {locations.map((loc) => (
                  <Badge
                    key={loc}
                    variant={selectedLocation === loc ? 'default' : 'outline'}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => setSelectedLocation(loc)}
                  >
                    {loc}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Specialiteit</h4>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedSpecialty === null ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-3"
                  onClick={() => setSelectedSpecialty(null)}
                >
                  Alle
                </Badge>
                {specialties.map((spec) => (
                  <Badge
                    key={spec}
                    variant={selectedSpecialty === spec ? 'default' : 'outline'}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => setSelectedSpecialty(spec)}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}

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

        {/* Lesson Series */}
        {/* Online Lesson Portal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-foreground">Online Lessenportaal</h3>
              <p className="text-sm text-secondary-foreground/70">Bekijk je gekochte lessen en volg live sessies</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => toast.info('Mijn lessen portaal komt binnenkort!')}
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-xl p-4 text-left transition-all"
            >
              <BookOpen className="w-5 h-5 mb-2" />
              <span className="font-medium text-sm">Mijn Lessen</span>
              <p className="text-xs text-primary/70 mt-1">0 actieve cursussen</p>
            </button>
            <button 
              onClick={() => toast.info('Live sessies portaal komt binnenkort!')}
              className="bg-accent/20 hover:bg-accent/30 text-accent-foreground rounded-xl p-4 text-left transition-all"
            >
              <Play className="w-5 h-5 mb-2 text-accent" />
              <span className="font-medium text-sm">Live Sessies</span>
              <p className="text-xs text-muted-foreground mt-1">Geen geplande sessies</p>
            </button>
          </div>
        </motion.div>

        {/* Lesson Series */}
        <h3 className="font-bold text-foreground mb-4">Beschikbare Lessenreeksen</h3>
        <div className="space-y-4">
          {filteredSeries.map((series, index) => (
            <motion.div
              key={series.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border hover:shadow-card hover:border-primary/20 transition-all group"
            >
              {/* Image Header */}
              <div className="relative h-32">
                <img
                  src={series.image}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {series.hasDiploma && (
                    <div className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Diploma
                    </div>
                  )}
                  <Badge className="bg-secondary text-secondary-foreground text-xs">
                    {series.level}
                  </Badge>
                </div>
                
                {/* Price */}
                <div className="absolute top-3 right-3">
                  <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full">
                    €{series.price}
                  </span>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-white text-lg">{series.title}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {series.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {series.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {series.instructor}
                    {series.instructorVerified && <Award className="w-3.5 h-3.5 text-primary" />}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{series.lessonsCount} lessen</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{series.totalDuration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{series.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-accent" fill="currentColor" />
                      <span>{series.rating}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleEnroll(series.title)}
                  className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80"
                >
                  Schrijf in
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}

          {filteredSeries.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Geen resultaten
              </h3>
              <p className="text-muted-foreground text-sm">
                Probeer andere filters of zoektermen
              </p>
            </div>
          )}
        </div>

        {/* Become Instructor */}
        {!isInstructor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-5 border border-accent/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Word Lesgever</h3>
                <p className="text-sm text-muted-foreground">
                  Deel je kennis en verdien bij. Upload je diploma om te starten.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
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
            <h3 className="font-display font-bold text-lg text-foreground">Jouw Lessenreeksen</h3>
            
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Maak een nieuwe lessenreeks</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload je diploma om te starten
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                onClick={() => toast.info('Lessenreeks aanmaken komt binnenkort!')}
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
