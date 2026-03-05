import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Check, Plus, X, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const allSpecialties = [
  'Elektriciteit', 'Domotica', 'Lampen', 'Stopcontacten', 'Zekeringskast', 'Laadpalen',
  'Loodgieter', 'Sanitair', 'Verwarming', 'Boilers', 'Lekken',
  'Tuinwerk', 'Grasmaaien', 'Hagen snoeien', 'Plantwerk',
  'Schilderen', 'Behangen', 'Decoratie',
  'Tegels', 'Badkamer', 'Keuken', 'Terras',
  'Timmerwerk', 'Meubels', 'Deuren', 'Ramen',
  'Zonnepanelen', 'Airco', 'Schoonmaak', 'Verhuizen',
];

// Specializations earned through completed courses
const diplomaSpecialties = [
  { name: 'Elektriciteit Basis tot Expert', specialty: 'Elektriciteit', completedAt: '10 jan 2026' },
  { name: 'Domotica & Smart Home', specialty: 'Domotica', completedAt: '20 feb 2026' },
];

const HandySkillsPage = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem('handymatch_skills');
    return saved ? JSON.parse(saved) : ['Elektriciteit', 'Domotica', 'Lampen', 'Stopcontacten', 'Zekeringskast', 'Laadpalen'];
  });

  const toggleSkill = (skill: string) => {
    // Don't allow removing diploma-earned skills
    const isDiplomaSkill = diplomaSpecialties.some(d => d.specialty === skill);
    if (isDiplomaSkill && selectedSkills.includes(skill)) {
      toast.error('Deze specialisatie is verdiend via een diploma en kan niet verwijderd worden');
      return;
    }

    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    localStorage.setItem('handymatch_skills', JSON.stringify(newSkills));
  };

  const handleSave = () => {
    localStorage.setItem('handymatch_skills', JSON.stringify(selectedSkills));
    toast.success('Specialisaties opgeslagen!');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Specialisaties" showBack />

      <div className="px-4 py-6">
        {/* Diploma-earned section */}
        {diplomaSpecialties.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Via diploma verdiend
            </h3>
            <div className="space-y-3">
              {diplomaSpecialties.map((diploma, i) => (
                <div key={i} className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{diploma.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Voltooid op {diploma.completedAt}</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">{diploma.specialty}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Volg meer lessen om automatisch specialisaties toe te voegen
            </p>
          </motion.div>
        )}

        {/* Manual skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-bold text-foreground mb-3">Alle specialisaties</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Selecteer je vaardigheden. Klanten zoeken op basis van deze tags.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {allSpecialties.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              const isDiploma = diplomaSpecialties.some(d => d.specialty === skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    isSelected
                      ? isDiploma
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {isDiploma && <Award className="w-3.5 h-3.5" />}
                  {skill}
                </button>
              );
            })}
          </div>

          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-primary/80">
            Opslaan ({selectedSkills.length} geselecteerd)
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HandySkillsPage;
