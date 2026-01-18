import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { BookOpen, Play, Star, Clock, Award, ChevronRight, GraduationCap, Upload, CheckCircle, MapPin, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Lessenreeksen data met diploma's
const lessenreeksen = [
  {
    id: '1',
    title: 'Elektriciteit Meester',
    instructor: 'Jan Vermeeren',
    instructorVerified: true,
    rating: 4.9,
    students: 1250,
    totalDuration: '16 uur',
    price: 149,
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
    level: 'Beginner',
    certifiable: true,
    lessons: 4,
    location: 'Leuven',
    diplomaType: 'HandyMatch Elektriciteit Diploma',
    description: 'Complete lessenreeks om elektriciteit onder de knie te krijgen',
  },
  {
    id: '2',
    title: 'Loodgieterij Basis tot Pro',
    instructor: 'Marie De Vos',
    instructorVerified: true,
    rating: 4.7,
    students: 890,
    totalDuration: '12 uur',
    price: 119,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400305e979?w=600&h=400&fit=crop',
    level: 'Beginner',
    certifiable: true,
    lessons: 3,
    location: 'Brussel',
    diplomaType: 'HandyMatch Loodgieterij Diploma',
    description: 'Van lekkende kraan tot complete badkamer installatie',
  },
  {
    id: '3',
    title: 'Tegelzetter Expert',
    instructor: 'Tom Janssen',
    instructorVerified: true,
    rating: 4.8,
    students: 650,
    totalDuration: '20 uur',
    price: 179,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
    level: 'Gevorderd',
    certifiable: true,
    lessons: 5,
    location: 'Antwerpen',
    diplomaType: 'HandyMatch Tegels Diploma',
    description: 'Professioneel tegelen voor badkamers en keukens',
  },
  {
    id: '4',
    title: 'Smart Home Specialist',
    instructor: 'Pieter Claes',
    instructorVerified: true,
    rating: 4.6,
    students: 420,
    totalDuration: '24 uur',
    price: 249,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop',
    level: 'Expert',
    certifiable: true,
    lessons: 6,
    location: 'Gent',
    diplomaType: 'HandyMatch Domotica Diploma',
    description: 'Volledige domotica en smart home installaties',
  },
  {
    id: '5',
    title: 'Schilderen Basiscursus',
    instructor: 'Lisa Peeters',
    instructorVerified: true,
    rating: 4.5,
    students: 780,
    totalDuration: '8 uur',
    price: 69,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop',
    level: 'Beginner',
    certifiable: false,
    lessons: 2,
    location: 'Leuven',
    diplomaType: null,
    description: 'Leer de basis van professioneel schilderen',
  },
  {
    id: '6',
    title: 'Tuinonderhoud Pro',
    instructor: 'Koen Willems',
    instructorVerified: true,
    rating: 4.4,
    students: 340,
    totalDuration: '10 uur',
    price: 89,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    level: 'Beginner',
    certifiable: false,
    lessons: 2,
    location: 'Mechelen',
    diplomaType: null,
    description: 'Tuinonderhoud, snoeien en gazonverzorging',
  },
];

const locations = ['Alle locaties', 'Leuven', 'Brussel', 'Antwerpen', 'Gent', 'Mechelen'];
const specialties = ['Elektriciteit', 'Loodgieterij', 'Tegels', 'Domotica', 'Schilderen', 'Tuinwerk'];

const LearningPage = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Alle locaties');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';
  const isInstructor = userType === 'instructor';

  const levels = ['Beginner', 'Gevorderd', 'Expert'];

  const filteredCourses = lessenreeksen.filter(course => {
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    const matchesLocation = selectedLocation === 'Alle locaties' || course.location === selectedLocation;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || 
      course.title.toLowerCase().includes(selectedSpecialty.toLowerCase());
    
    return matchesLevel && matchesLocation && matchesSearch && matchesSpecialty;
  });

  const handleEnroll = (courseTitle: string) => {
    toast.success(`Ingeschreven voor "${courseTitle}"!`, {
      description: 'Je ontvangt een bevestiging via email',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Lessen" showBack />

      <div className="px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Zoek lessenreeksen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-border bg-card"
          />
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          {locations.map((location) => (
            <Badge
              key={location}
              variant={selectedLocation === location ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1.5 whitespace-nowrap transition-all ${
                selectedLocation === location 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-primary/10'
              }`}
              onClick={() => setSelectedLocation(location)}
            >
              {location}
            </Badge>
          ))}
        </div>

        {/* Intro Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl p-6 text-primary-foreground mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-1">
                {isHandy ? 'Word Gecertificeerd' : 'Leer van Experts'}
              </h2>
              <p className="text-sm opacity-90">
                {isHandy 
                  ? 'Volg lessenreeksen en verdien je HandyMatch diploma om geverifieerd te zijn'
                  : 'Volg privélessen en word een betere klusser'
                }
              </p>
            </div>
          </div>

          {isHandy && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-foreground/20">
              <Award className="w-4 h-4" />
              <span className="text-sm">Diploma = Geverifieerd badge + meer klanten!</span>
            </div>
          )}
        </motion.div>

        {/* Specialty Filter */}
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Specialiteit</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge
              variant={selectedSpecialty === null ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1.5 whitespace-nowrap ${
                selectedSpecialty === null ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => setSelectedSpecialty(null)}
            >
              Alles
            </Badge>
            {specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1.5 whitespace-nowrap ${
                  selectedSpecialty === specialty ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-2">Niveau</p>
          <div className="flex gap-2">
            <Badge
              variant={selectedLevel === null ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 ${
                selectedLevel === null ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => setSelectedLevel(null)}
            >
              Alle niveaus
            </Badge>
            {levels.map((level) => (
              <Badge
                key={level}
                variant={selectedLevel === level ? 'default' : 'outline'}
                className={`cursor-pointer px-4 py-2 ${
                  selectedLevel === level ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lessenreeksen */}
        <h3 className="font-display font-bold text-lg text-foreground mb-4">
          {isHandy ? 'Beschikbare Lessenreeksen' : 'Populaire Lessen'}
          <span className="text-muted-foreground font-normal text-sm ml-2">
            ({filteredCourses.length})
          </span>
        </h3>

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
                <div className="w-32 h-36 flex-shrink-0 relative">
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
                    <div className="absolute top-2 left-2 bg-secondary text-primary text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Diploma
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground pr-2 group-hover:text-primary transition-colors text-sm">
                      {course.title}
                    </h3>
                    <Badge className="bg-accent/10 text-accent text-xs flex-shrink-0">
                      €{course.price}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <span className="text-xs">{course.instructor}</span>
                    {course.instructorVerified && (
                      <Award className="w-3 h-3 text-primary" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-secondary" fill="currentColor" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.totalDuration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{course.lessons} lessen</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs py-0">
                      {course.level}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {course.location}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {course.students}
                    </div>
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

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Geen lessenreeksen gevonden</p>
            <p className="text-sm text-muted-foreground mt-1">Probeer andere filters</p>
          </div>
        )}

        {/* Diploma Info */}
        {isHandy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-secondary/20 rounded-2xl p-5 border border-secondary/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/40 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">HandyMatch Diploma</h3>
                <p className="text-sm text-muted-foreground">
                  Volg een volledige lessenreeks en krijg een geverifieerd badge op je profiel
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-card rounded-xl">
                <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Geverifieerd</p>
              </div>
              <div className="text-center p-3 bg-card rounded-xl">
                <Star className="w-5 h-5 text-secondary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Meer vertrouwen</p>
              </div>
              <div className="text-center p-3 bg-card rounded-xl">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Meer klanten</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Become Instructor */}
        {!isInstructor && !isHandy && (
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
                  Deel je kennis en verdien bij
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