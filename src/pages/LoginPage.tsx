import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hammer, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType || 'seeker';
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.email || !formData.password || (!isLogin && !formData.username)) {
      toast.error('Vul alle velden in');
      return;
    }

    // Store user type
    localStorage.setItem('handymatch_userType', userType);
    localStorage.setItem('handymatch_user', JSON.stringify({
      email: formData.email,
      username: formData.username || formData.email.split('@')[0],
    }));

    toast.success(isLogin ? 'Welkom terug!' : 'Account aangemaakt!');
    navigate('/swipe');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Hammer className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Handy<span className="text-accent">Match</span>
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            {isLogin ? 'Welkom terug' : 'Account aanmaken'}
          </h1>
          <p className="text-secondary">
            {isLogin 
              ? 'Log in om verder te gaan' 
              : 'Maak een account om te starten'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4 flex-1"
        >
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Gebruikersnaam"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="pl-12 h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="E-mailadres"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-12 h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Wachtwoord"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-12 pr-12 h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {isLogin && (
            <button type="button" className="text-sm text-primary font-medium hover:underline">
              Wachtwoord vergeten?
            </button>
          )}
        </motion.form>
      </div>

      {/* Bottom */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6 safe-area-bottom space-y-4"
      >
        <button
          onClick={handleSubmit}
          className="w-full py-4 px-6 rounded-2xl btn-cta font-semibold text-lg flex items-center justify-center gap-3"
        >
          {isLogin ? 'Inloggen' : 'Account aanmaken'}
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-secondary">
          {isLogin ? 'Nog geen account? ' : 'Al een account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? 'Registreer nu' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
