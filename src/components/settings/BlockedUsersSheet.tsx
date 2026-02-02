import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Ban, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface BlockedUsersSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: string;
}

// Mock data
const mockBlockedUsers: BlockedUser[] = [];

export const BlockedUsersSheet = ({ isOpen, onClose }: BlockedUsersSheetProps) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(mockBlockedUsers);

  const handleUnblock = (userId: string, name: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
    toast.success(`${name} gedeblokkeerd`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <Ban className="w-5 h-5 text-primary" />
            Geblokkeerde Gebruikers
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100%-80px)]">
          {blockedUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Geen geblokkeerde gebruikers</p>
              <p className="text-sm text-muted-foreground mt-2">
                Gebruikers die je blokkeert kunnen geen contact meer opnemen
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50"
                >
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Geblokkeerd op {user.blockedAt}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(user.id, user.name)}
                    className="rounded-xl"
                  >
                    Deblokkeer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
