import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [canResetPassword, setCanResetPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeRecoveryState = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryParams = new URLSearchParams(window.location.search);

      const isRecoveryIntent =
        hashParams.get('type') === 'recovery' ||
        queryParams.get('type') === 'recovery' ||
        Boolean(hashParams.get('access_token')) ||
        Boolean(queryParams.get('code'));

      const authCode = queryParams.get('code');
      if (authCode) {
        await supabase.auth.exchangeCodeForSession(authCode);
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      setCanResetPassword(Boolean(data.session?.user) || isRecoveryIntent);
      setIsCheckingLink(false);
    };

    initializeRecoveryState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setCanResetPassword(Boolean(session?.user));
        setIsCheckingLink(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canResetPassword) {
      toast.error('Deze resetlink is ongeldig of verlopen. Vraag een nieuwe aan.');
      return;
    }

    if (!password || password.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 tekens hebben');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Wachtwoord succesvol bijgewerkt');
      navigate('/login', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isCheckingLink || !canResetPassword || isSubmitting;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Nieuw wachtwoord</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isCheckingLink
            ? 'Resetlink wordt gecontroleerd...'
            : !canResetPassword
              ? 'Deze link is verlopen. Vraag een nieuwe resetmail aan.'
              : 'Voer je nieuwe wachtwoord in om weer in te loggen.'}
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Nieuw wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12"
              disabled={isDisabled}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Herhaal wachtwoord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-11 h-12"
              disabled={isDisabled}
            />
          </div>

          <Button type="submit" className="w-full h-12" disabled={isDisabled}>
            {isSubmitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-2">
                Wachtwoord opslaan
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
