import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, UserPlus, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoachTip {
  title: string;
  description: string;
  icon: string;
}

const MONTHLY_TIPS: Record<number, CoachTip[]> = {
  0: [ // January
    { title: 'Vorstgevoelige leidingen controleren', description: 'Check leidingen in onverwarmde ruimtes en isoleer ze indien nodig.', icon: '❄️' },
    { title: 'Isolatie zolder nakijken', description: 'Controleer of de zolderisolatie goed aansluit en nergens beschadigd is.', icon: '🏠' },
    { title: 'Verwarmingsfilters reinigen', description: 'Schone filters zorgen voor efficiëntere verwarming.', icon: '🔥' },
  ],
  1: [ // February
    { title: 'Voegen badkamer controleren', description: 'Check siliconen voegen op schimmel en slijtage.', icon: '🚿' },
    { title: 'Rookmelders testen', description: 'Test alle rookmelders en vervang batterijen indien nodig.', icon: '🔔' },
    { title: 'Ventilatie roosters reinigen', description: 'Schone roosters zorgen voor gezonde lucht in huis.', icon: '💨' },
  ],
  2: [ // March
    { title: 'Dakgoot reinigen na winter', description: 'Verwijder bladeren en vuil uit dakgoten voor het regenseizoen.', icon: '🍂' },
    { title: 'Buitenschilderwerk inspecteren', description: 'Check verfwerk op bladderende plekken na de winter.', icon: '🎨' },
    { title: 'Tuingereedschap klaarmaken', description: 'Slijp messen, olie scharnieren en controleer apparatuur.', icon: '🌱' },
  ],
  3: [ // April
    { title: 'Buitenkranen weer openen', description: 'Open de buitenkranen en check op lekken door vorst.', icon: '🚰' },
    { title: 'Ramen en deuren smeren', description: 'Smeer scharnieren en sloten voor soepel gebruik.', icon: '🪟' },
    { title: 'Terras reinigen', description: 'Een goede schoonmaakbeurt na de winter doet wonderen.', icon: '🧹' },
  ],
  4: [ // May
    { title: 'Airco voorbereiden op zomer', description: 'Laat de airco nakijken en filters reinigen voor het warme seizoen.', icon: '❄️' },
    { title: 'Zonwering controleren', description: 'Test rolluiken en zonneschermen op goede werking.', icon: '☀️' },
    { title: 'Insectenramen plaatsen', description: 'Voorkom muggen door horren te plaatsen of te controleren.', icon: '🪰' },
  ],
  5: [ // June
    { title: 'Waterafvoer tuin controleren', description: 'Zorg dat hemelwater goed wegstroomt bij onweersbuien.', icon: '🌧️' },
    { title: 'Dakisolatie controleren', description: 'Goede dakisolatie houdt het huis koel in de zomer.', icon: '🏠' },
    { title: 'Barbecue en terras seizoensklaar', description: 'Check gasaansluitingen en maak het terras gezellig.', icon: '🍖' },
  ],
  6: [ // July
    { title: 'Tuinbesproeiing optimaliseren', description: 'Stel timers in en check sproeiers op efficiëntie.', icon: '💧' },
    { title: 'Binnenshuis koel houden', description: 'Gebruik folie of gordijnen om warmte buiten te houden.', icon: '🌡️' },
    { title: 'Zwembad/vijver onderhoud', description: 'Controleer waterchemie en filters regelmatig.', icon: '🏊' },
  ],
  7: [ // August
    { title: 'Oprit en paden controleren', description: 'Check op scheuren in oprit of tuinpaden.', icon: '🛤️' },
    { title: 'Houtwerk behandelen', description: 'Behandel houten tuinmeubels en schuttingen tegen verwering.', icon: '🪵' },
    { title: 'Voorbereiden op herfst', description: 'Plan het winterklaar maken van tuin en buitenruimtes.', icon: '🍁' },
  ],
  8: [ // September
    { title: 'Verwarmingsketel laten nakijken', description: 'Plan een onderhoudsbeurt vóór het stookseizoen begint.', icon: '🔥' },
    { title: 'Schoorsteenveger plannen', description: 'Laat de schoorsteen vegen voor de eerste koude dagen.', icon: '🏠' },
    { title: 'Tuin winterklaar maken', description: 'Snoei planten en bescherm vorstgevoelige soorten.', icon: '🌿' },
  ],
  9: [ // October
    { title: 'Verwarmingsketel laten nakijken', description: 'Laatste kans voor een onderhoudsbeurt voor de winter.', icon: '🔥' },
    { title: 'Buitenkranen isoleren', description: 'Voorkom bevroren leidingen door kranen af te sluiten en te isoleren.', icon: '🚰' },
    { title: 'Voorraaad stookolie checken', description: 'Bestel tijdig stookolie voor de winter.', icon: '🛢️' },
  ],
  10: [ // November
    { title: 'Dakpannen controleren voor stormseiZoen', description: 'Check op losse of beschadigde dakpannen.', icon: '🏠' },
    { title: 'Buitenverlichting controleren', description: 'Donkere dagen: check alle buitenlampen en sensoren.', icon: '💡' },
    { title: 'Tochtstrips vervangen', description: 'Nieuwe tochtstrips besparen energie en geld.', icon: '🌬️' },
  ],
  11: [ // December
    { title: 'Kerstverlichting veilig aansluiten', description: 'Gebruik veilige, waterdichte aansluitingen buiten.', icon: '🎄' },
    { title: 'Noodkit samenstellen', description: 'Check zaklamp, batterijen en EHBO voor winterstormen.', icon: '🔦' },
    { title: 'Jaarlijkse woninginspectie', description: 'Maak een ronde door je huis en noteer wat aandacht nodig heeft.', icon: '📋' },
  ],
};

export const HouseCoach = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const tips = MONTHLY_TIPS[currentMonth] || MONTHLY_TIPS[0];

  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {t('dashboard.coachTitle', 'Huiscoach')} — {monthNames[currentMonth]}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('dashboard.coachSubtitle', 'Seizoensgebonden tips om je woning in topconditie te houden')}
        </p>
      </div>

      {/* Tips */}
      {tips.map((tip, index) => (
        <motion.div
          key={tip.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{tip.icon}</span>
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm">{tip.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs h-8 gap-1"
                  onClick={() => navigate(`/ai?topic=${encodeURIComponent(tip.title)}`)}
                >
                  <Wrench className="w-3 h-3" />
                  {t('dashboard.diyButton', 'Doe het zelf')}
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl text-xs h-8 gap-1"
                  onClick={() => navigate('/swipe')}
                >
                  <UserPlus className="w-3 h-3" />
                  {t('dashboard.bookHandyman', 'Boek handyman')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
