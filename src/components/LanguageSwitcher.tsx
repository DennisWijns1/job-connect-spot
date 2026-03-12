import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { i18n } = useTranslation();

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <Select value={i18n.language} onValueChange={(val) => i18n.changeLanguage(val)}>
      <SelectTrigger className={compact ? 'w-auto gap-2 h-10 rounded-xl border-border' : 'w-full h-12 rounded-xl'}>
        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
        <SelectValue>
          {compact ? currentLang.flag : `${currentLang.flag} ${currentLang.label}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
