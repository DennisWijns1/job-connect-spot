import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ExternalLink, Clock, MapPin } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes: number;
  location?: string;
  otherParty: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

// Mock appointments
const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Lekkende kraan repareren',
    description: 'Kraan in de badkamer lekt',
    scheduledAt: new Date('2025-01-20T10:00:00'),
    durationMinutes: 60,
    location: 'Kerkstraat 12, Amsterdam',
    otherParty: 'Jan de Vries',
    status: 'confirmed',
  },
  {
    id: '2',
    title: 'Tuin onderhoud',
    description: 'Gras maaien en heggen snoeien',
    scheduledAt: new Date('2025-01-22T14:00:00'),
    durationMinutes: 120,
    location: 'Hoofdweg 45, Haarlem',
    otherParty: 'Maria Jansen',
    status: 'scheduled',
  },
  {
    id: '3',
    title: 'Lamp ophangen',
    scheduledAt: new Date('2025-01-25T09:00:00'),
    durationMinutes: 30,
    location: 'Prinsengracht 88, Amsterdam',
    otherParty: 'Pieter Bakker',
    status: 'scheduled',
  },
];

export const CalendarSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get appointments for selected date
  const appointmentsForDate = selectedDate
    ? mockAppointments.filter((apt) => isSameDay(apt.scheduledAt, selectedDate))
    : [];

  // Get all dates with appointments for highlighting
  const appointmentDates = mockAppointments.map((apt) => apt.scheduledAt);

  const generateGoogleCalendarUrl = (appointment: Appointment) => {
    const startTime = appointment.scheduledAt.toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = new Date(
      appointment.scheduledAt.getTime() + appointment.durationMinutes * 60000
    ).toISOString().replace(/-|:|\.\d+/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: appointment.title,
      dates: `${startTime}/${endTime}`,
      details: appointment.description || '',
      location: appointment.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateICSContent = (appointment: Appointment) => {
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
    };

    const startDate = formatICSDate(appointment.scheduledAt);
    const endDate = formatICSDate(
      new Date(appointment.scheduledAt.getTime() + appointment.durationMinutes * 60000)
    );

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HandyMatch//NL
BEGIN:VEVENT
UID:${appointment.id}@handymatch.nl
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${appointment.title}
DESCRIPTION:${appointment.description || ''}
LOCATION:${appointment.location || ''}
END:VEVENT
END:VCALENDAR`;
  };

  const downloadICS = (appointment: Appointment) => {
    const icsContent = generateICSContent(appointment);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appointment.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success';
      case 'scheduled':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg text-foreground">Agenda</h3>
      </div>

      {/* Calendar */}
      <div className="flex justify-center mb-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={nl}
          className="rounded-xl border-0"
          modifiers={{
            hasAppointment: appointmentDates,
          }}
          modifiersStyles={{
            hasAppointment: {
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              color: 'hsl(var(--primary))',
              fontWeight: 'bold',
            },
          }}
        />
      </div>

      {/* Appointments for selected date */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          {selectedDate
            ? format(selectedDate, "EEEE d MMMM", { locale: nl })
            : 'Selecteer een datum'}
        </h4>

        {appointmentsForDate.length > 0 ? (
          appointmentsForDate.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 rounded-xl bg-background border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-foreground">{appointment.title}</h5>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status === 'confirmed' ? 'Bevestigd' : 
                   appointment.status === 'scheduled' ? 'Gepland' :
                   appointment.status === 'completed' ? 'Afgerond' : 'Geannuleerd'}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {format(appointment.scheduledAt, 'HH:mm')} -{' '}
                    {format(
                      new Date(
                        appointment.scheduledAt.getTime() +
                          appointment.durationMinutes * 60000
                      ),
                      'HH:mm'
                    )}
                  </span>
                </div>
                {appointment.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{appointment.location}</span>
                  </div>
                )}
                <p className="text-foreground">Met: {appointment.otherParty}</p>
              </div>

              {/* Export buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs rounded-lg"
                  onClick={() => window.open(generateGoogleCalendarUrl(appointment), '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs rounded-lg"
                  onClick={() => downloadICS(appointment)}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Apple/Outlook
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Geen afspraken op deze dag
          </p>
        )}
      </div>
    </div>
  );
};
