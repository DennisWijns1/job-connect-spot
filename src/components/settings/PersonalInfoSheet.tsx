import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PersonalInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = 'handymatch_personal_info';

export const PersonalInfoSheet = ({ isOpen, onClose }: PersonalInfoSheetProps) => {
  const [info, setInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (isOpen) {
      const user = JSON.parse(localStorage.getItem('handymatch_user') || '{}');
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedInfo = stored ? JSON.parse(stored) : {};
      
      setInfo({
        name: storedInfo.name || user.username || '',
        email: storedInfo.email || user.email || '',
        phone: storedInfo.phone || '',
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    toast.success('Gegevens opgeslagen!');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Persoonlijke Informatie
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="name">Naam</Label>
            <Input
              id="name"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              placeholder="Je volledige naam"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
              placeholder="email@voorbeeld.be"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              type="tel"
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              placeholder="+32 xxx xx xx xx"
              className="rounded-xl"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white font-semibold mt-4"
          >
            <Save className="w-4 h-4 mr-2" />
            Opslaan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
