import type { LucideIcon } from 'lucide-react';

export type TrustBadge = { icon: LucideIcon; label: string; description: string };

export function TrustBadges({ badges }: { badges: TrustBadge[] }) {
  return (
    // Flex, not a fixed 5-column grid: with 4 badges a 5-column grid leaves an empty column and
    // the whole row reads as left-aligned. Flex + justify-center centres the row for any count.
    <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 text-center">
      {badges.map(({ icon: Icon, label, description }) => (
        <div key={label} className="flex w-36 flex-col items-center gap-2 sm:w-44">
          <Icon size={20} className="flex-shrink-0 text-brand-leaf" />
          <div>
            <p className="text-sm font-semibold text-brand-deep">{label}</p>
            <p className="text-xs text-brand-deep/50">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
