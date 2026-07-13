import type { LucideIcon } from 'lucide-react';

export type TrustBadge = { icon: LucideIcon; label: string; description: string };

export function TrustBadges({ badges }: { badges: TrustBadge[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {badges.map(({ icon: Icon, label, description }) => (
        <div key={label} className="flex items-start gap-3">
          <Icon size={20} className="mt-0.5 flex-shrink-0 text-brand-leaf" />
          <div>
            <p className="text-sm font-semibold text-brand-deep">{label}</p>
            <p className="text-xs text-brand-deep/50">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
