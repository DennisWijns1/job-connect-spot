import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { HammerRating } from '@/components/HammerRating';
import { CalendarSection } from '@/components/CalendarSection';
import { CreateProjectSheet } from '@/components/CreateProjectSheet';
import { FavoritesSheet } from '@/components/FavoritesSheet';
import { LocationEditSheet, getStoredAddress, type UserAddress } from '@/components/LocationEditSheet';
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
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';
  const [isOnline, setIsOnline] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showLocationEdit, setShowLocationEdit] = useState(false);
  const [userAddress, setUserAddress] = useState<UserAddress>(getStoredAddress());
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem('handymatch_user') || '{}');

  useEffect(() => {
    setUserAddress(getStoredAddress());
    // Load saved avatar
    const savedAvatar = localStorage.getItem('handymatch_avatar');
    if (savedAvatar) setAvatarPreview(savedAvatar);
  }, []);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Foto mag maximaal 5MB zijn');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      localStorage.setItem('handymatch_avatar', dataUrl);
      toast.success('Profielfoto bijgewerkt!');
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleOpenCamera = async () => {
    setShowAvatarMenu(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
      
      const canvas = document.createElement('canvas');
      
      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'position:absolute;bottom:40px;display:flex;gap:16px;z-index:10;';
      
      const snapBtn = document.createElement('button');
      snapBtn.textContent = '📸 Maak foto';
      snapBtn.style.cssText = 'padding:12px 24px;border-radius:999px;background:#F97316;color:#fff;font-weight:600;border:none;font-size:16px;';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Annuleer';
      cancelBtn.style.cssText = 'padding:12px 24px;border-radius:999px;background:rgba(255,255,255,0.2);color:#fff;font-weight:600;border:none;font-size:16px;';

      const cleanup = () => {
        stream.getTracks().forEach(t => t.stop());
        overlay.remove();
      };

      cancelBtn.onclick = cleanup;
      snapBtn.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) processFile(new File([blob], 'camera.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85);
        cleanup();
      };

      video.style.cssText = 'max-width:100%;max-height:80vh;border-radius:16px;';
      btnRow.append(snapBtn, cancelBtn);
      overlay.append(video, btnRow);
      document.body.appendChild(overlay);
    } catch {
      toast.error('Camera niet beschikbaar. Controleer je rechten.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('handymatch_userType');
    localStorage.removeItem('handymatch_user');
    toast.success('Tot ziens!');
    navigate('/');
  };

  const menuItems = isHandy
    ? [
        { icon: Camera, label: 'Foto\'s beheren', description: 'Upload werken', path: '/profile/photos', navigate: true },
        { icon: CheckCircle, label: 'Afgewerkte projecten', description: 'Bekijk voltooide klussen', path: '/profile/completed', navigate: true },
        { icon: Briefcase, label: 'Specialisaties', description: 'Bewerk vaardigheden', path: '/profile/skills', navigate: true },
        { icon: BookOpen, label: 'Lessen & Trainingen', description: 'Leer nieuwe vaardigheden', path: '/learn' },
        { icon: MapPin, label: 'Werkgebied', description: 'Stel je bereik in', path: '/profile/area' },
        { icon: Shield, label: 'Verificatie', description: 'Word geverifieerd', path: '/profile/verify' },
      ]
    : [
        { icon: Plus, label: 'Project plaatsen', description: 'Beschrijf je klus', action: 'createProject' },
        { icon: Star, label: 'Favorieten', description: 'Opgeslagen Handy\'s', action: 'favorites' },
        { icon: MapPin, label: 'Locatie', description: `${userAddress.street}, ${userAddress.postalCode} ${userAddress.city}`, action: 'location' },
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
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profiel" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-button"
              >
                <Camera className="w-4 h-4" />
              </button>
              {showAvatarMenu && (
                <div className="absolute -bottom-20 -right-2 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
                  <button onClick={handleOpenCamera} className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm text-foreground w-full">
                    <Camera className="w-4 h-4" /> Camera
                  </button>
                  <button onClick={() => { setShowAvatarMenu(false); avatarInputRef.current?.click(); }} className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm text-foreground w-full">
                    <User className="w-4 h-4" /> Bestand
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl text-foreground">
                {user.username || 'Gebruiker'}
              </h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
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
            isHandy ? 'bg-secondary text-foreground' : 'bg-accent/10 text-accent'
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
              onClick={() => {
                if ('action' in item) {
                  if (item.action === 'createProject') {
                    setShowCreateProject(true);
                  } else if (item.action === 'favorites') {
                    setShowFavorites(true);
                  } else if (item.action === 'location') {
                    setShowLocationEdit(true);
                  }
                } else if ('path' in item) {
                  toast.info('Deze functie komt binnenkort!');
                }
              }}
              className={`w-full flex items-center gap-4 p-4 hover:bg-background transition-colors text-left ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Calendar/Agenda Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <CalendarSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl overflow-hidden shadow-card"
        >
          <button
            onClick={() => navigate('/settings')}
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
            onClick={() => navigate('/help')}
            className="w-full flex items-center gap-4 p-4 hover:bg-background transition-colors text-left border-b border-border"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Help & Support</p>
              <p className="text-sm text-muted-foreground">Klantenservice & FAQ</p>
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

      {/* Sheets */}
      <CreateProjectSheet 
        isOpen={showCreateProject} 
        onClose={() => setShowCreateProject(false)} 
      />
      <FavoritesSheet 
        isOpen={showFavorites} 
        onClose={() => setShowFavorites(false)} 
      />
      <LocationEditSheet 
        isOpen={showLocationEdit} 
        onClose={() => setShowLocationEdit(false)}
        onSave={(addr) => setUserAddress(addr)}
      />

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
