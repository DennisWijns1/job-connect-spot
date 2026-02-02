import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

interface LocationEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (address: UserAddress) => void;
}

export interface UserAddress {
  street: string;
  postalCode: string;
  city: string;
}

const STORAGE_KEY = 'handymatch_user_address';

const defaultAddress: UserAddress = {
  street: 'Martensstraat 39',
  postalCode: '3271',
  city: 'Averbode',
};

export const getStoredAddress = (): UserAddress => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultAddress;
};

export const LocationEditSheet = ({ isOpen, onClose, onSave }: LocationEditSheetProps) => {
  const [address, setAddress] = useState<UserAddress>(defaultAddress);

  useEffect(() => {
    if (isOpen) {
      setAddress(getStoredAddress());
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
    onSave?.(address);
    toast.success('Adres opgeslagen!');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Locatie bewerken
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="street">Straat en huisnummer</Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              placeholder="bv. Kerkstraat 123"
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postcode</Label>
              <Input
                id="postalCode"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                placeholder="1000"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Gemeente</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="Brussel"
                className="rounded-xl"
              />
            </div>
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
