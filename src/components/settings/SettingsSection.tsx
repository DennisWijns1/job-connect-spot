interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <div className="mb-6">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 mb-2">
      {title}
    </h3>
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      {children}
    </div>
  </div>
);
