import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CloudSun, Wind, Droplets, Snowflake, Zap, Loader2 } from 'lucide-react';
import { useWeatherAlerts } from '@/hooks/useWeatherAlerts';
import { Badge } from '@/components/ui/badge';

const alertIcons: Record<string, typeof Wind> = {
  wind: Wind,
  rain: Droplets,
  frost: Snowflake,
  thunder: Zap,
};

export const WeatherWarnings = () => {
  const { t } = useTranslation();
  const { alerts, loading, temperature } = useWeatherAlerts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current weather */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary rounded-2xl p-4 border border-primary/20">
        <div className="flex items-center gap-3">
          <CloudSun className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">
              {temperature !== undefined ? `${Math.round(temperature)}°C` : '--'}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.weatherLocation', 'Jouw locatie • komende 72 uur')}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 ? (
        alerts.map((alert, index) => {
          const Icon = alertIcons[alert.type] || Wind;
          return (
            <motion.div
              key={alert.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-warning/30 shadow-sm overflow-hidden"
            >
              <div className="bg-warning/10 px-4 py-3 flex items-center gap-2">
                <Icon className="w-5 h-5 text-warning" />
                <span className="font-semibold text-foreground text-sm">{alert.title}</span>
                <Badge variant="outline" className="ml-auto text-warning border-warning/30 text-xs">
                  {t('dashboard.warning', 'Waarschuwing')}
                </Badge>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">{alert.body}</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground uppercase tracking-wider">
                    {t('dashboard.preventiveActions', 'Preventieve acties')}:
                  </p>
                  {alert.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })
      ) : (
        <div className="text-center py-12">
          <span className="text-4xl">☀️</span>
          <p className="text-foreground font-medium mt-3">{t('dashboard.noAlerts', 'Geen waarschuwingen')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.noAlertsDesc', 'Er zijn geen extreme weersomstandigheden verwacht in de komende 72 uur')}
          </p>
        </div>
      )}
    </div>
  );
};
