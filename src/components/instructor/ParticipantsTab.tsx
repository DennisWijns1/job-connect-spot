import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Heart, 
  Bell,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Enrollment {
  id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  lesson: {
    title: string;
  };
  user_id: string;
}

interface Follower {
  id: string;
  name: string;
  avatar: string;
  followedAt: string;
  notificationsEnabled: boolean;
}

interface ParticipantsTabProps {
  enrollments: Enrollment[];
}

// Mock followers data - zou uit database komen
const mockFollowers: Follower[] = [
  { id: '1', name: 'Sophie De Vries', avatar: 'https://randomuser.me/api/portraits/women/32.jpg', followedAt: '2024-01-15', notificationsEnabled: true },
  { id: '2', name: 'Thomas Bakker', avatar: 'https://randomuser.me/api/portraits/men/44.jpg', followedAt: '2024-01-10', notificationsEnabled: true },
  { id: '3', name: 'Emma Janssen', avatar: 'https://randomuser.me/api/portraits/women/55.jpg', followedAt: '2024-01-05', notificationsEnabled: false },
];

// Mock participant details - zou uit database komen
const mockParticipants = [
  { id: '1', name: 'Jan Peters', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Maria Van Dijk', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', name: 'Pieter Smits', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
];

export const ParticipantsTab = ({ enrollments }: ParticipantsTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState('all');

  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const activeEnrollments = enrollments.filter(e => e.status !== 'completed');

  const getParticipantDetails = (userId: string, index: number) => {
    return mockParticipants[index % mockParticipants.length];
  };

  return (
    <motion.div
      key="participants"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{enrollments.length}</p>
          <p className="text-xs text-muted-foreground">Totaal</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{activeEnrollments.length}</p>
          <p className="text-xs text-muted-foreground">Actief</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Heart className="w-5 h-5 text-destructive mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{mockFollowers.length}</p>
          <p className="text-xs text-muted-foreground">Volgers</p>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="w-full bg-secondary rounded-xl p-1">
          <TabsTrigger value="all" className="flex-1 rounded-lg text-sm">Alle</TabsTrigger>
          <TabsTrigger value="active" className="flex-1 rounded-lg text-sm">Ingeschreven</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 rounded-lg text-sm">Voltooid</TabsTrigger>
          <TabsTrigger value="followers" className="flex-1 rounded-lg text-sm">Volgers</TabsTrigger>
        </TabsList>

        {/* All Participants */}
        <TabsContent value="all" className="mt-4">
          {enrollments.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Nog geen deelnemers</h3>
              <p className="text-sm text-muted-foreground">Publiceer je lessen om deelnemers aan te trekken</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment, index) => {
                const participant = getParticipantDetails(enrollment.user_id, index);
                return (
                  <div
                    key={enrollment.id}
                    className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={participant.avatar} 
                        alt={participant.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{participant.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{enrollment.lesson.title}</span>
                        </div>
                      </div>
                      {enrollment.status === 'completed' ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Voltooid
                        </Badge>
                      ) : enrollment.status === 'in_progress' ? (
                        <Badge className="bg-accent text-accent-foreground">Bezig</Badge>
                      ) : (
                        <Badge variant="secondary">Ingeschreven</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(enrollment.enrolled_at).toLocaleDateString('nl-BE')}
                      </span>
                      {enrollment.progress_percentage > 0 && (
                        <span>Voortgang: {enrollment.progress_percentage}%</span>
                      )}
                    </div>

                    {enrollment.progress_percentage > 0 && enrollment.status !== 'completed' && (
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Active Enrollments */}
        <TabsContent value="active" className="mt-4">
          {activeEnrollments.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Geen actieve inschrijvingen</h3>
              <p className="text-sm text-muted-foreground">Er zijn momenteel geen deelnemers bezig met je lessen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeEnrollments.map((enrollment, index) => {
                const participant = getParticipantDetails(enrollment.user_id, index);
                return (
                  <div key={enrollment.id} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <img src={participant.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.lesson.title}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">{enrollment.progress_percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="mt-4">
          {completedEnrollments.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Nog geen voltooide lessen</h3>
              <p className="text-sm text-muted-foreground">Voltooide lessen verschijnen hier</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedEnrollments.map((enrollment, index) => {
                const participant = getParticipantDetails(enrollment.user_id, index);
                return (
                  <div key={enrollment.id} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <img src={participant.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.lesson.title}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Followers */}
        <TabsContent value="followers" className="mt-4">
          <div className="bg-secondary/50 rounded-xl p-3 mb-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              Volgers ontvangen een melding wanneer je een nieuwe les publiceert
            </p>
          </div>

          {mockFollowers.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Nog geen volgers</h3>
              <p className="text-sm text-muted-foreground">Bouw je reputatie op om volgers te krijgen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockFollowers.map((follower) => (
                <div key={follower.id} className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <img src={follower.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{follower.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Volgt sinds {new Date(follower.followedAt).toLocaleDateString('nl-BE')}
                      </p>
                    </div>
                    {follower.notificationsEnabled && (
                      <Bell className="w-4 h-4 text-accent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
