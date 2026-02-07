import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, MapPin, FileText, ExternalLink, Check } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface AppointmentData {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
}

interface AddToCalendarSheetProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  onConfirm: (appointment: AppointmentData) => void;
}

export const AddToCalendarSheet = ({
  isOpen,
  onClose,
  participantName,
  onConfirm,
}: AddToCalendarSheetProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const generateGoogleCalendarUrl = () => {
    if (!date) return '';
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(endHour, endMin, 0, 0);
    
    const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Afspraak met ${participantName}`,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
      details: notes || `Afspraak via HandyMatch met ${participantName}`,
      location: location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateICSContent = () => {
    if (!date) return '';
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(endHour, endMin, 0, 0);
    
    const formatICSDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HandyMatch//NL
BEGIN:VEVENT
UID:${Date.now()}@handymatch.nl
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Afspraak met ${participantName}
DESCRIPTION:${notes || `Afspraak via HandyMatch met ${participantName}`}
LOCATION:${location || ''}
END:VEVENT
END:VCALENDAR`;
  };

  const downloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `afspraak_${participantName.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (!date) {
      toast.error('Selecteer een datum');
      return;
    }
    
    onConfirm({
      title: `Afspraak met ${participantName}`,
      date,
      startTime,
      endTime,
      location: location || undefined,
      notes: notes || undefined,
    });
    
    toast.success('Afspraak toegevoegd!', {
      description: `${format(date, 'd MMMM', { locale: nl })} om ${startTime}`,
    });
    
    onClose();
  };

  const handleExportGoogle = () => {
    const url = generateGoogleCalendarUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Afspraak Toevoegen
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Participant */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">Afspraak met</p>
            <p className="font-semibold text-foreground">{participantName}</p>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-12 rounded-xl',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: nl }) : <span>Kies een datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={nl}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Starttijd
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Eindtijd
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Locatie (optioneel)
            </Label>
            <Input
              placeholder="Bijv. Kerkstraat 12, Leuven"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Notitie (optioneel)
            </Label>
            <Input
              placeholder="Bijv. Lekkende kraan repareren"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Add to Calendar Button */}
          <Button
            onClick={handleConfirm}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
          >
            <Check className="w-5 h-5 mr-2" />
            Toevoegen aan agenda
          </Button>

          {/* Export Options */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Of exporteren naar:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleExportGoogle}
                className="h-12 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={downloadICS}
                className="h-12 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Apple/Outlook
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
