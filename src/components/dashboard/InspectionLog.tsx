import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, CheckCircle2, Clock, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useHomeInspections, INSPECTION_TYPES, getInspectionStatus } from '@/hooks/useHomeInspections';
import { AddInspectionSheet } from '@/components/dashboard/AddInspectionSheet';

export const InspectionLog = () => {
  const { t } = useTranslation();
  const { inspections, loading, deleteInspection } = useHomeInspections();
  const [showAdd, setShowAdd] = useState(false);

  const statusConfig = {
    ok: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2, label: 'OK' },
    warning: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock, label: t('dashboard.expiringSoon', 'Binnenkort') },
    expired: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle, label: t('dashboard.expired', 'Vervallen') },
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteInspection(id);
    if (error) toast.error(t('common.error'));
    else toast.success(t('dashboard.inspectionDeleted', 'Keuring verwijderd'));
  };

  const getTypeLabel = (type: string) => {
    return INSPECTION_TYPES.find(t => t.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {(['ok', 'warning', 'expired'] as const).map(status => {
          const count = inspections.filter(i => getInspectionStatus(i.next_due) === status).length;
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <div key={status} className={`rounded-2xl p-3 border ${cfg.color}`}>
              <Icon className="w-5 h-5 mb-1" />
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Inspection list */}
      <AnimatePresence>
        {inspections.map(insp => {
          const status = getInspectionStatus(insp.next_due);
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          const daysLeft = differenceInDays(new Date(insp.next_due), new Date());

          return (
            <motion.div
              key={insp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-foreground">
                      {insp.custom_label || getTypeLabel(insp.type)}
                    </span>
                    <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.lastInspection', 'Laatste keuring')}: {format(new Date(insp.date_performed), 'd MMM yyyy', { locale: nl })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.nextDue', 'Volgende')}: {format(new Date(insp.next_due), 'd MMM yyyy', { locale: nl })}
                    {status === 'ok' && <span className="text-success"> ({daysLeft} {t('dashboard.daysLeft', 'dagen')})</span>}
                    {status === 'warning' && <span className="text-warning font-medium"> ({daysLeft} {t('dashboard.daysLeft', 'dagen')}!)</span>}
                    {status === 'expired' && <span className="text-destructive font-medium"> ({t('dashboard.overdue', 'verlopen')})</span>}
                  </p>
                  {insp.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{insp.notes}"</p>}
                </div>
                <button
                  onClick={() => handleDelete(insp.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {inspections.length === 0 && (
        <div className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t('dashboard.noInspections', 'Nog geen keuringen geregistreerd')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('dashboard.addFirstInspection', 'Voeg je eerste keuring toe om op tijd herinneringen te krijgen')}</p>
        </div>
      )}

      {/* Add button */}
      <Button
        onClick={() => setShowAdd(true)}
        className="w-full rounded-2xl h-12 gap-2"
      >
        <Plus className="w-4 h-4" />
        {t('dashboard.addInspection', 'Keuring toevoegen')}
      </Button>

      <AddInspectionSheet open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
};
