import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InspectionLog } from '@/components/dashboard/InspectionLog';
import { HouseCoach } from '@/components/dashboard/HouseCoach';
import { WeatherWarnings } from '@/components/dashboard/WeatherWarnings';
import { PushNotificationBanner } from '@/components/PushNotificationBanner';
import { InstallPromptBanner } from '@/components/InstallPromptBanner';
import { ClipboardCheck, Home, CloudSun } from 'lucide-react';

const DashboardPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('inspections');

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title={t('dashboard.title', 'Woning Dashboard')} showBack />

      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 rounded-2xl h-12">
            <TabsTrigger value="inspections" className="rounded-xl gap-1.5 text-xs">
              <ClipboardCheck className="w-4 h-4" />
              {t('dashboard.inspections', 'Keuringen')}
            </TabsTrigger>
            <TabsTrigger value="coach" className="rounded-xl gap-1.5 text-xs">
              <Home className="w-4 h-4" />
              {t('dashboard.coach', 'Huiscoach')}
            </TabsTrigger>
            <TabsTrigger value="weather" className="rounded-xl gap-1.5 text-xs">
              <CloudSun className="w-4 h-4" />
              {t('dashboard.weather', 'Weer')}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)] mt-4">
            <TabsContent value="inspections" className="mt-0">
              <InspectionLog />
            </TabsContent>
            <TabsContent value="coach" className="mt-0">
              <HouseCoach />
            </TabsContent>
            <TabsContent value="weather" className="mt-0">
              <WeatherWarnings />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      <PushNotificationBanner />
      <InstallPromptBanner />
      <BottomNav />
    </div>
  );
};

export default DashboardPage;
