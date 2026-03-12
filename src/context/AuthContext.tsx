import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: string | null;
  specialty: string | null;
  hourly_rate: number | null;
  location: string | null;
  bio: string | null;
  is_online: boolean | null;
  onboarding_completed?: boolean | null;
  linkedin_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  activeRole: 'seeker' | 'handy' | 'instructor';
  switchRole: (role: 'seeker' | 'handy' | 'instructor') => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userType: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'seeker' | 'handy' | 'instructor'>(() => {
    return (localStorage.getItem('handymatch_activeRole') as 'seeker' | 'handy' | 'instructor') || 'seeker';
  });

  const switchRole = (role: 'seeker' | 'handy' | 'instructor') => {
    setActiveRole(role);
    localStorage.setItem('handymatch_activeRole', role);
    localStorage.setItem('handymatch_userType', role);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      setProfile(data as Profile);
      if (data.user_type) {
        localStorage.setItem('handymatch_userType', data.user_type);
        // If user only has one role, set it automatically
        const singleRoles = ['seeker', 'handy', 'instructor'];
        if (singleRoles.includes(data.user_type)) {
          setActiveRole(data.user_type as 'seeker' | 'handy' | 'instructor');
          localStorage.setItem('handymatch_activeRole', data.user_type);
        } else {
          // Multi-role: keep stored preference or default to seeker
          const stored = localStorage.getItem('handymatch_activeRole') as 'seeker' | 'handy' | 'instructor' | null;
          const validRoles = ['seeker', 'handy', 'instructor'];
          if (!stored || !validRoles.includes(stored)) {
            setActiveRole('seeker');
            localStorage.setItem('handymatch_activeRole', 'seeker');
          }
        }
      }
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id).finally(() => setIsLoading(false));
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (email: string, password: string, userType: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        user_type: userType,
        is_online: false,
        onboarding_completed: false,
        is_handy: userType === 'handy' || userType === 'both',
        is_instructor: userType === 'instructor',
      });
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    localStorage.removeItem('handymatch_userType');
    localStorage.removeItem('handymatch_user');
    localStorage.removeItem('handymatch_activeRole');
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, activeRole, switchRole, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
