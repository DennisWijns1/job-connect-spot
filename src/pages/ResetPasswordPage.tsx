import { useMemo, useState } from 'react';
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

  const isRecoveryLink = useMemo(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return hashParams.get('type') === 'recovery';
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRecoveryLink) {
      toast.error('Deze resetlink is ongeldig of verlopen');
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Nieuw wachtwoord</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {!isRecoveryLink
            ? 'Open deze pagina via de resetlink in je e-mail.'
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
              disabled={!isRecoveryLink || isSubmitting}
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
              disabled={!isRecoveryLink || isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12"
            disabled={!isRecoveryLink || isSubmitting}
          >
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
