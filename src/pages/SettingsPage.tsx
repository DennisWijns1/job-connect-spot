import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BottomNav } from '@/components/BottomNav';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { SettingsToggle } from '@/components/settings/SettingsToggle';
import { PersonalInfoSheet } from '@/components/settings/PersonalInfoSheet';
import { SecuritySheet } from '@/components/settings/SecuritySheet';
import { BlockedUsersSheet } from '@/components/settings/BlockedUsersSheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Lock,
  ShieldCheck,
  Eye,
  MapPin,
  Activity,
  Ban,
  Star,
  CheckCircle2,
  Heart,
  MessageCircle,
  Bell,
  Filter,
  Download,
  FileText,
  LogOut,
  Trash2,
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Sheet states
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  
  // Toggle states
  const [settings, setSettings] = useState({
    profilePublic: true,
    showExactLocation: false,
    showOnlineStatus: true,
    showRatings: true,
    showCompletedJobs: true,
    notifyMatches: true,
    notifyMessages: true,
    notifyUpdates: false,
    onlyVerifiedContacts: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(t('settings.settingSaved'));
  };

  const handleLogout = () => {
    localStorage.removeItem('handymatch_userType');
    localStorage.removeItem('handymatch_user');
    toast.success(t('common.goodbye'));
    navigate('/');
  };

  const handleDeleteAccount = () => {
    toast.error('Account verwijderen is momenteel uitgeschakeld', {
      description: 'Neem contact op met support voor hulp',
    });
  };

  const handleDownloadData = () => {
    toast.success('Data export gestart', {
      description: 'Je ontvangt een e-mail wanneer de download klaar is',
    });
  };

  // Check verification status (mock)
  const isVerified = false;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Instellingen" showBack />

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="px-4 py-6">
          {/* Section 1: Account Beheer */}
          <SettingsSection title="Account Beheer">
            <SettingsItem
              icon={User}
              label="Persoonlijke Informatie"
              description="Naam, e-mail, telefoonnummer"
              onClick={() => setShowPersonalInfo(true)}
            />
            <SettingsItem
              icon={Lock}
              label="Wachtwoord & Beveiliging"
              description="Wachtwoord wijzigen, 2FA"
              onClick={() => setShowSecurity(true)}
            />
            <SettingsItem
              icon={ShieldCheck}
              label="Verificatiestatus"
              description={isVerified ? 'Je profiel is geverifieerd' : 'Nog niet geverifieerd'}
              onClick={() => toast.info('Verificatie is momenteel in ontwikkeling')}
              rightElement={
                <Badge 
                  variant={isVerified ? 'default' : 'secondary'}
                  className={isVerified ? 'bg-success' : ''}
                >
                  {isVerified ? 'Geverifieerd' : 'Pending'}
                </Badge>
              }
            />
          </SettingsSection>

          {/* Section 2: Privacy & Zichtbaarheid */}
          <SettingsSection title="Privacy & Zichtbaarheid">
            <SettingsToggle
              icon={Eye}
              label="Profiel openbaar"
              description="Zichtbaar voor alle gebruikers"
              checked={settings.profilePublic}
              onCheckedChange={(v) => updateSetting('profilePublic', v)}
            />
            <SettingsToggle
              icon={MapPin}
              label="Exacte locatie delen"
              description="Anders alleen woonplaats/regio"
              checked={settings.showExactLocation}
              onCheckedChange={(v) => updateSetting('showExactLocation', v)}
            />
            <SettingsToggle
              icon={Activity}
              label="Online status tonen"
              description="'Laatst actief' zichtbaar"
              checked={settings.showOnlineStatus}
              onCheckedChange={(v) => updateSetting('showOnlineStatus', v)}
            />
            <SettingsItem
              icon={Ban}
              label="Geblokkeerde gebruikers"
              description="Beheer geblokkeerde accounts"
              onClick={() => setShowBlockedUsers(true)}
            />
          </SettingsSection>

          {/* Section 3: Reputatie & Historiek */}
          <SettingsSection title="Reputatie & Historiek">
            <SettingsToggle
              icon={Star}
              label="Ratings zichtbaar"
              description="Toon beoordelingen op profiel"
              checked={settings.showRatings}
              onCheckedChange={(v) => updateSetting('showRatings', v)}
            />
            <SettingsToggle
              icon={CheckCircle2}
              label="Voltooide klussen tonen"
              description="Aantal afgeronde projecten"
              checked={settings.showCompletedJobs}
              onCheckedChange={(v) => updateSetting('showCompletedJobs', v)}
            />
          </SettingsSection>

          {/* Section 4: Interactie & Meldingen */}
          <SettingsSection title="Interactie & Meldingen">
            <SettingsToggle
              icon={Heart}
              label="Nieuwe matches"
              description="Notificatie bij match"
              checked={settings.notifyMatches}
              onCheckedChange={(v) => updateSetting('notifyMatches', v)}
            />
            <SettingsToggle
              icon={MessageCircle}
              label="Ontvangen berichten"
              description="Notificatie bij bericht"
              checked={settings.notifyMessages}
              onCheckedChange={(v) => updateSetting('notifyMessages', v)}
            />
            <SettingsToggle
              icon={Bell}
              label="App updates"
              description="Nieuws en functie updates"
              checked={settings.notifyUpdates}
              onCheckedChange={(v) => updateSetting('notifyUpdates', v)}
            />
            <SettingsToggle
              icon={Filter}
              label="Enkel geverifieerde gebruikers"
              description="Beperk wie contact kan opnemen"
              checked={settings.onlyVerifiedContacts}
              onCheckedChange={(v) => updateSetting('onlyVerifiedContacts', v)}
            />
          </SettingsSection>

          {/* Section 5: Juridisch & Data */}
          <SettingsSection title="Juridisch & Data">
            <SettingsItem
              icon={Download}
              label="Download mijn data"
              description="GDPR data export"
              onClick={handleDownloadData}
            />
            <SettingsItem
              icon={FileText}
              label="Algemene Voorwaarden"
              description="Lees onze voorwaarden"
              onClick={() => toast.info('Algemene Voorwaarden openen...')}
            />
            <SettingsItem
              icon={FileText}
              label="Privacybeleid"
              description="Lees ons privacybeleid"
              onClick={() => toast.info('Privacybeleid openen...')}
            />
          </SettingsSection>

          {/* Action Buttons */}
          <div className="space-y-3 mt-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 rounded-2xl border-border"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
            
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full h-12 rounded-2xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Account verwijderen
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Sheets */}
      <PersonalInfoSheet 
        isOpen={showPersonalInfo} 
        onClose={() => setShowPersonalInfo(false)} 
      />
      <SecuritySheet 
        isOpen={showSecurity} 
        onClose={() => setShowSecurity(false)} 
      />
      <BlockedUsersSheet 
        isOpen={showBlockedUsers} 
        onClose={() => setShowBlockedUsers(false)} 
      />

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
