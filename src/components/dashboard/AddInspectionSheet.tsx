import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addYears } from 'date-fns';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHomeInspections, INSPECTION_TYPES } from '@/hooks/useHomeInspections';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddInspectionSheet = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const { addInspection } = useHomeInspections();
  const [type, setType] = useState('gasketel');
  const [customLabel, setCustomLabel] = useState('');
  const [datePerformed, setDatePerformed] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customInterval, setCustomInterval] = useState('1');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedType = INSPECTION_TYPES.find(t => t.value === type);
  const interval = type === 'aangepast' ? parseFloat(customInterval) || 1 : (selectedType?.interval || 1);

  const handleSave = async () => {
    setSaving(true);
    const nextDue = format(addYears(new Date(datePerformed), interval), 'yyyy-MM-dd');

    const { error } = (await addInspection({
      type,
      custom_label: type === 'aangepast' ? customLabel : null,
      date_performed: datePerformed,
      next_due: nextDue,
      interval_years: interval,
      notes: notes || null,
    })) || { error: 'Unknown error' };

    setSaving(false);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('dashboard.inspectionAdded', 'Keuring geregistreerd!'));
      onOpenChange(false);
      // Reset
      setType('gasketel');
      setCustomLabel('');
      setDatePerformed(format(new Date(), 'yyyy-MM-dd'));
      setNotes('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('dashboard.addInspection', 'Keuring toevoegen')}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Type selection */}
          <div>
            <Label className="text-sm font-medium">{t('dashboard.inspectionType', 'Type keuring')}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {INSPECTION_TYPES.map(it => (
                <button
                  key={it.value}
                  onClick={() => setType(it.value)}
                  className={`p-3 rounded-xl text-left text-sm border transition-all ${
                    type === it.value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {it.label}
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {it.value === 'aangepast'
                      ? t('dashboard.customInterval', 'Eigen interval')
                      : `${it.interval} ${it.interval === 1 ? t('dashboard.year', 'jaar') : t('dashboard.years', 'jaar')}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom label for custom type */}
          {type === 'aangepast' && (
            <div>
              <Label>{t('dashboard.customName', 'Naam keuring')}</Label>
              <Input
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                placeholder={t('dashboard.customNamePlaceholder', 'Bijv. Airco onderhoud')}
                className="rounded-xl mt-1"
              />
              <Label className="mt-2 block">{t('dashboard.intervalYears', 'Interval (jaren)')}</Label>
              <Input
                type="number"
                value={customInterval}
                onChange={e => setCustomInterval(e.target.value)}
                min="0.5"
                step="0.5"
                className="rounded-xl mt-1"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <Label>{t('dashboard.datePerformed', 'Datum keuring')}</Label>
            <Input
              type="date"
              value={datePerformed}
              onChange={e => setDatePerformed(e.target.value)}
              className="rounded-xl mt-1"
            />
          </div>

          {/* Auto-calculated next due */}
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{t('dashboard.nextDueAuto', 'Volgende keuring (automatisch)')}</p>
            <p className="text-sm font-medium text-foreground">
              {datePerformed ? format(addYears(new Date(datePerformed), interval), 'dd/MM/yyyy') : '-'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label>{t('dashboard.notes', 'Notities')}</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('dashboard.notesPlaceholder', 'Naam bedrijf, opmerkingen...')}
              className="rounded-xl mt-1"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-2xl h-12">
            {saving ? t('common.loading') : t('dashboard.saveInspection', 'Keuring opslaan')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
