import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CalendarSection } from '@/components/CalendarSection';
import { Calendar } from 'lucide-react';

interface CalendarSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarSheet = ({ isOpen, onClose }: CalendarSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[340px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Mijn Agenda
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <CalendarSection />
        </div>
      </SheetContent>
    </Sheet>
  );
};
