import { useState, useEffect } from 'react';

interface WeatherAlert {
  type: 'wind' | 'rain' | 'frost' | 'thunder';
  title: string;
  body: string;
  actions: string[];
  icon: string;
}

interface WeatherData {
  alerts: WeatherAlert[];
  loading: boolean;
  temperature?: number;
  description?: string;
}

const ALERT_CONFIGS: Record<string, WeatherAlert> = {
  wind: {
    type: 'wind',
    icon: '💨',
    title: '⚠️ Storm op komst',
    body: 'Windstoten boven 60 km/u verwacht',
    actions: [
      'Zet tuinmeubelen en losse voorwerpen binnen',
      'Controleer of je terrasoverkapping goed vast zit',
      'Sluit alle ramen en deuren stevig',
    ],
  },
  rain: {
    icon: '🌧️',
    title: '🌧️ Zware regen verwacht',
    body: 'Meer dan 20mm neerslag verwacht',
    actions: [
      'Controleer dakgoten op verstoppingen',
      'Zorg dat alle afvoeren vrij zijn',
      'Check kelderramen en dichtingen',
    ],
  },
  frost: {
    icon: '❄️',
    title: '❄️ Vorst verwacht',
    body: 'Temperatuur daalt onder -2°C',
    actions: [
      'Isoleer buitenkranen met beschermhoezen',
      'Laat binnenkomende leidingen lichtjes druppelen',
      'Controleer isolatie van waterleidingen in onverwarmde ruimtes',
    ],
  },
  thunder: {
    icon: '⛈️',
    title: '⛈️ Onweer op komst',
    body: 'Onweer voorspeld in de komende uren',
    actions: [
      'Koppel gevoelige elektronica los van het stroomnet',
      'Haal buitenantennes en schotelantennes na',
      'Vermijd gebruik van bedrade telefoons',
    ],
  },
};

export const useWeatherAlerts = (lat = 50.88, lon = 4.7) => {
  const [data, setData] = useState<WeatherData>({ alerts: [], loading: true });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,wind_gusts_10m,weather_code&forecast_days=3&timezone=auto`;
        const res = await fetch(url);
        const json = await res.json();

        const alerts: WeatherAlert[] = [];
        const hourly = json.hourly;

        // Check wind gusts > 60 km/h
        if (hourly.wind_gusts_10m?.some((v: number) => v > 60)) {
          alerts.push(ALERT_CONFIGS.wind);
        }

        // Check precipitation > 20mm in any 24h period
        const precip = hourly.precipitation || [];
        for (let i = 0; i < precip.length - 24; i++) {
          const sum24h = precip.slice(i, i + 24).reduce((a: number, b: number) => a + b, 0);
          if (sum24h > 20) { alerts.push(ALERT_CONFIGS.rain); break; }
        }

        // Check temperature < -2°C
        if (hourly.temperature_2m?.some((v: number) => v < -2)) {
          alerts.push(ALERT_CONFIGS.frost);
        }

        // Check thunderstorm weather codes (95, 96, 99)
        if (hourly.weather_code?.some((v: number) => [95, 96, 99].includes(v))) {
          alerts.push(ALERT_CONFIGS.thunder);
        }

        const currentTemp = hourly.temperature_2m?.[0];

        setData({ alerts, loading: false, temperature: currentTemp });
      } catch {
        setData({ alerts: [], loading: false });
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // refresh every 30 min
    return () => clearInterval(interval);
  }, [lat, lon]);

  return data;
};
