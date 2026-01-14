import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { HammerRating } from '@/components/HammerRating';
import {
  User,
  Camera,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Briefcase,
  BookOpen,
  Plus,
  Star,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';
  const [isOnline, setIsOnline] = useState(true);

  const user = JSON.parse(localStorage.getItem('handymatch_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('handymatch_userType');
    localStorage.removeItem('handymatch_user');
    toast.success('Tot ziens!');
    navigate('/');
  };

  const menuItems = isHandy
    ? [
        { icon: Camera, label: 'Foto\'s beheren', description: 'Upload werken', path: '/profile/photos' },
        { icon: Briefcase, label: 'Specialisaties', description: 'Bewerk vaardigheden', path: '/profile/skills' },
        { icon: BookOpen, label: 'Lessen & Trainingen', description: 'Leer nieuwe vaardigheden', path: '/learn' },
        { icon: MapPin, label: 'Werkgebied', description: 'Stel je bereik in', path: '/profile/area' },
        { icon: Shield, label: 'Verificatie', description: 'Word geverifieerd', path: '/profile/verify' },
      ]
    : [
        { icon: Plus, label: 'Project plaatsen', description: 'Beschrijf je klus', path: '/project/new' },
        { icon: Star, label: 'Favorieten', description: 'Opgeslagen Handy\'s', path: '/favorites' },
        { icon: MapPin, label: 'Locatie', description: 'Bewerk je adres', path: '/profile/location' },
      ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Profiel" />

      <div className="px-4 py-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-card mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-button">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl text-foreground">
                {user.username || 'Gebruiker'}
              </h2>
              <p className="text-secondary text-sm">{user.email}</p>
              {isHandy && (
                <div className="flex items-center gap-2 mt-2">
                  <HammerRating rating={4.5} size="sm" />
                  <span className="text-sm text-muted-foreground">(0 reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* User Type Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
            isHandy ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
          }`}>
            {isHandy ? <Briefcase className="w-4 h-4" /> : <User className="w-4 h-4" />}
            <span className="font-medium text-sm">
              {isHandy ? 'Handy Account' : 'Zoeker Account'}
            </span>
          </div>

          {/* Online Toggle for Handy */}
          {isHandy && (
            <div className="flex items-center justify-between mt-4 p-4 bg-background rounded-xl">
              <div>
                <p className="font-medium text-foreground">Online status</p>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? 'Je bent zichtbaar' : 'Je bent offline'}
                </p>
              </div>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
            </div>
          )}
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl overflow-hidden shadow-card mb-6"
        >
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => toast.info('Deze functie komt binnenkort!')}
              className={`w-full flex items-center gap-4 p-4 hover:bg-background transition-colors text-left ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Settings & Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl overflow-hidden shadow-card"
        >
          <button
            onClick={() => toast.info('Instellingen komen binnenkort!')}
            className="w-full flex items-center gap-4 p-4 hover:bg-background transition-colors text-left border-b border-border"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Instellingen</p>
              <p className="text-sm text-muted-foreground">Account & privacy</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-destructive">Uitloggen</p>
              <p className="text-sm text-muted-foreground">Tot de volgende keer!</p>
            </div>
          </button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
