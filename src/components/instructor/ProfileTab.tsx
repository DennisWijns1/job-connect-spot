import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle, 
  Shield, 
  Award, 
  Briefcase, 
  Clock, 
  Edit, 
  CheckCircle,
  Mail,
  Phone,
  Star,
  Users,
  Euro,
  Camera,
  Video,
  BookOpen,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  phone?: string;
}

interface ProfileTabProps {
  instructor: Instructor | null;
}

export const ProfileTab = ({ instructor }: ProfileTabProps) => {
  const navigate = useNavigate();

  if (!instructor) return null;

  const verificationItems = [
    {
      icon: Shield,
      title: 'Identiteit',
      description: 'ID verificatie',
      verified: instructor.identity_verified,
    },
    {
      icon: Award,
      title: 'Diploma',
      description: 'Opleiding geverifieerd',
      verified: instructor.diploma_verified,
    },
    {
      icon: Briefcase,
      title: 'Ervaring',
      description: 'Werkervaring bevestigd',
      verified: instructor.experience_verified,
    },
  ];

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Profile Card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Cover/Header */}
        <div className="h-24 bg-gradient-to-r from-primary to-primary/80 relative">
          <button className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar & Basic Info */}
        <div className="px-5 pb-5 -mt-12 relative">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card overflow-hidden shadow-card">
              {instructor.avatar_url ? (
                <img src={instructor.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h3 className="font-bold text-lg text-foreground">{instructor.full_name}</h3>
              {instructor.verification_status === 'verified' && (
                <Badge className="bg-success/10 text-success border-success/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Geverifieerd
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Star className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="font-bold text-foreground">{instructor.average_rating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="font-bold text-foreground">{instructor.total_students}</p>
              <p className="text-xs text-muted-foreground">Deelnemers</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Euro className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="font-bold text-foreground">€{instructor.total_revenue}</p>
              <p className="text-xs text-muted-foreground">Verdiend</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{instructor.email}</span>
            </div>
            {instructor.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{instructor.phone}</span>
              </div>
            )}
            {instructor.years_experience && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{instructor.years_experience} jaar ervaring</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {instructor.bio && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Over mij</h4>
              <p className="text-foreground">{instructor.bio}</p>
            </div>
          )}

          {/* Expertise */}
          {instructor.expertise && instructor.expertise.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {instructor.expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="rounded-lg">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Verificatie status</h3>
        <div className="space-y-3">
          {verificationItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.verified ? 'bg-success/10' : 'bg-muted'}`}>
                  <item.icon className={`w-5 h-5 ${item.verified ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {item.verified ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <Badge variant="outline" className="text-xs">Niet geverifieerd</Badge>
              )}
            </div>
          ))}
        </div>

        {(!instructor.identity_verified || !instructor.diploma_verified || !instructor.experience_verified) && (
          <Button 
            className="w-full mt-4 rounded-xl bg-accent hover:bg-accent/90"
            onClick={() => navigate('/instructor/register')}
          >
            Verificatie voltooien
          </Button>
        )}
      </div>

      {/* Public Profile Preview */}
      <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Dit profiel is zichtbaar voor particulieren en handymen die op zoek zijn naar lessen.
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 rounded-xl"
          >
            <Video className="w-4 h-4 mr-2" />
            Video toevoegen
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 rounded-xl"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Portfolio
          </Button>
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
};
