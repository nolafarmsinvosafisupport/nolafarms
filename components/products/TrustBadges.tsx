import type { LucideIcon } from 'lucide-react';

export type TrustBadge = { icon: LucideIcon; label: string; description: string };

/**
 * `dark` is opt-in and defaults to false, so the existing light usage on /products is untouched.
 * The dark variant exists because the homepage section sits on farm-dark, where the light
 * variant's brand-deep text would be near-invisible.
 */
export function TrustBadges({ badges, dark = false }: { badges: TrustBadge[]; dark?: boolean }) {
  return (
    // Flex, not a fixed 5-column grid: with 4 badges a 5-column grid leaves an empty column and
    // the whole row reads as left-aligned. Flex + justify-center centres the row for any count.
    <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 text-center">
      {badges.map(({ icon: Icon, label, description }) => (
        <div key={label} className="flex w-36 flex-col items-center gap-2 sm:w-44">
          {dark ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-warm/15">
              <Icon size={18} className="flex-shrink-0 text-gold-warm" />
            </span>
          ) : (
            <Icon size={20} className="flex-shrink-0 text-brand-leaf" />
          )}
          <div>
            <p className={`text-sm font-semibold ${dark ? 'text-cream-primary' : 'text-brand-deep'}`}>{label}</p>
            <p className={`text-xs leading-5 ${dark ? 'text-cream-secondary/55' : 'text-brand-deep/50'}`}>
              {description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
