import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
    toast.error(t('settings.deleteAccountDisabled'), {
      description: t('settings.contactSupport'),
    });
  };

  const handleDownloadData = () => {
    toast.success(t('settings.dataExportStarted'), {
      description: t('settings.dataExportDesc'),
    });
  };

  // Check verification status (mock)
  const isVerified = false;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title={t('settings.title')} showBack />

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="px-4 py-6">
          {/* Language Switcher */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {t('settings.language')}
            </h3>
            <div className="bg-card rounded-3xl p-4 shadow-card">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Section 1: Account Beheer */}
          <SettingsSection title={t('settings.accountManagement')}>
            <SettingsItem
              icon={User}
              label={t('settings.personalInfo')}
              description={t('settings.personalInfoDesc')}
              onClick={() => setShowPersonalInfo(true)}
            />
            <SettingsItem
              icon={Lock}
              label={t('settings.passwordSecurity')}
              description={t('settings.passwordSecurityDesc')}
              onClick={() => setShowSecurity(true)}
            />
            <SettingsItem
              icon={ShieldCheck}
              label={t('settings.verificationStatus')}
              description={isVerified ? t('settings.verifiedProfile') : t('settings.notVerified')}
              onClick={() => toast.info(t('settings.verificationInDev'))}
              rightElement={
                <Badge 
                  variant={isVerified ? 'default' : 'secondary'}
                  className={isVerified ? 'bg-success' : ''}
                >
                  {isVerified ? t('settings.verified') : t('settings.pending')}
                </Badge>
              }
            />
          </SettingsSection>

          {/* Section 2: Privacy & Zichtbaarheid */}
          <SettingsSection title={t('settings.privacyVisibility')}>
            <SettingsToggle
              icon={Eye}
              label={t('settings.publicProfile')}
              description={t('settings.publicProfileDesc')}
              checked={settings.profilePublic}
              onCheckedChange={(v) => updateSetting('profilePublic', v)}
            />
            <SettingsToggle
              icon={MapPin}
              label={t('settings.exactLocation')}
              description={t('settings.exactLocationDesc')}
              checked={settings.showExactLocation}
              onCheckedChange={(v) => updateSetting('showExactLocation', v)}
            />
            <SettingsToggle
              icon={Activity}
              label={t('settings.showOnlineStatus')}
              description={t('settings.showOnlineStatusDesc')}
              checked={settings.showOnlineStatus}
              onCheckedChange={(v) => updateSetting('showOnlineStatus', v)}
            />
            <SettingsItem
              icon={Ban}
              label={t('settings.blockedUsers')}
              description={t('settings.blockedUsersDesc')}
              onClick={() => setShowBlockedUsers(true)}
            />
          </SettingsSection>

          {/* Section 3: Reputatie & Historiek */}
          <SettingsSection title={t('settings.reputationHistory')}>
            <SettingsToggle
              icon={Star}
              label={t('settings.ratingsVisible')}
              description={t('settings.ratingsVisibleDesc')}
              checked={settings.showRatings}
              onCheckedChange={(v) => updateSetting('showRatings', v)}
            />
            <SettingsToggle
              icon={CheckCircle2}
              label={t('settings.showCompletedJobs')}
              description={t('settings.showCompletedJobsDesc')}
              checked={settings.showCompletedJobs}
              onCheckedChange={(v) => updateSetting('showCompletedJobs', v)}
            />
          </SettingsSection>

          {/* Section 4: Interactie & Meldingen */}
          <SettingsSection title={t('settings.interactionNotifications')}>
            <SettingsToggle
              icon={Heart}
              label={t('settings.newMatches')}
              description={t('settings.newMatchesDesc')}
              checked={settings.notifyMatches}
              onCheckedChange={(v) => updateSetting('notifyMatches', v)}
            />
            <SettingsToggle
              icon={MessageCircle}
              label={t('settings.receivedMessages')}
              description={t('settings.receivedMessagesDesc')}
              checked={settings.notifyMessages}
              onCheckedChange={(v) => updateSetting('notifyMessages', v)}
            />
            <SettingsToggle
              icon={Bell}
              label={t('settings.appUpdates')}
              description={t('settings.appUpdatesDesc')}
              checked={settings.notifyUpdates}
              onCheckedChange={(v) => updateSetting('notifyUpdates', v)}
            />
            <SettingsToggle
              icon={Filter}
              label={t('settings.verifiedOnly')}
              description={t('settings.verifiedOnlyDesc')}
              checked={settings.onlyVerifiedContacts}
              onCheckedChange={(v) => updateSetting('onlyVerifiedContacts', v)}
            />
          </SettingsSection>

          {/* Section 5: Juridisch & Data */}
          <SettingsSection title={t('settings.legalData')}>
            <SettingsItem
              icon={Download}
              label={t('settings.downloadData')}
              description={t('settings.downloadDataDesc')}
              onClick={handleDownloadData}
            />
            <SettingsItem
              icon={FileText}
              label={t('settings.terms')}
              description={t('settings.termsDesc')}
              onClick={() => toast.info(t('settings.terms'))}
            />
            <SettingsItem
              icon={FileText}
              label={t('settings.privacyPolicy')}
              description={t('settings.privacyPolicyDesc')}
              onClick={() => toast.info(t('settings.privacyPolicy'))}
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
              {t('common.logout')}
            </Button>
            
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full h-12 rounded-2xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('settings.deleteAccount')}
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
