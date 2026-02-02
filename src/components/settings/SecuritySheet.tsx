import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Lock, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SecuritySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecuritySheet = ({ isOpen, onClose }: SecuritySheetProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }
    
    if (newPassword && newPassword.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 tekens bevatten');
      return;
    }

    toast.success('Beveiligingsinstellingen opgeslagen!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Wachtwoord & Beveiliging
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6 overflow-y-auto">
          {/* Password Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Wachtwoord wijzigen</h4>
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Huidig wachtwoord</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig nieuw wachtwoord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* 2FA Section */}
          <div className="p-4 bg-muted/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Tweestapsverificatie (2FA)</p>
                <p className="text-sm text-muted-foreground">
                  Extra beveiliging bij het inloggen
                </p>
              </div>
              <Switch 
                checked={twoFactorEnabled} 
                onCheckedChange={setTwoFactorEnabled} 
              />
            </div>
            {twoFactorEnabled && (
              <p className="text-sm text-muted-foreground mt-3 pl-14">
                Je ontvangt een verificatiecode via SMS of authenticator app
              </p>
            )}
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            Wijzigingen opslaan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
