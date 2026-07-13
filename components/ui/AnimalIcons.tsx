/**
 * Cow and goat icons.
 *
 * lucide-react has no cow, goat, sheep or cattle icon — only `beef` (a cut of steak) and
 * `paw-print`, which is why the cattle card was showing a steak and the goats card a paw. These
 * are drawn to match lucide's conventions (24x24 viewBox, currentColor stroke, round caps) so
 * they sit correctly beside PiggyBank.
 */

type IconProps = {
  size?: number;
  className?: string;
};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  // Slightly heavier than lucide's default 2-at-24px equivalent would suggest, because these
  // carry more detail (horns, ears, muzzle) and render at ~20px inside the card badge.
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function CowIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      {/* horns */}
      <path d="M7 6.5C6 5 4.6 4.3 3.2 4.6" />
      <path d="M17 6.5c1-1.5 2.4-2.2 3.8-1.9" />
      {/* ears */}
      <path d="M7 8.2C5.4 7.5 3.9 7.9 3.3 9c-.5 1 .1 2.2 1.4 2.8" />
      <path d="M17 8.2c1.6-.7 3.1-.3 3.7.8.5 1-.1 2.2-1.4 2.8" />
      {/* head */}
      <path d="M7 7h10v4.5a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7Z" />
      {/* eyes */}
      <circle cx="9.7" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.3" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
      {/* muzzle */}
      <rect x="9" y="13" width="6" height="4.2" rx="2.1" />
      <circle cx="10.8" cy="15.1" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="13.2" cy="15.1" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GoatIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      {/* Horns sweeping back, ears DROOPING down — the first attempt had upswept horns plus
          side-jutting ears, which gave four points and read as a fox. Drooping ears plus a beard
          are what make it a goat. */}
      <path d="M10 6.6C9.1 4.7 7.5 3.5 5.4 3.3" />
      <path d="M14 6.6c.9-1.9 2.5-3.1 4.6-3.3" />
      {/* drooping ears */}
      <path d="M9.4 9.4c-2.3-.7-4.5.3-5.3 2.5 2 1.1 4.2-.1 5.3-1.6Z" />
      <path d="M14.6 9.4c2.3-.7 4.5.3 5.3 2.5-2 1.1-4.2-.1-5.3-1.6Z" />
      {/* narrow head tapering to the muzzle */}
      <path d="M9.4 6.6h5.2v4.9a3.2 3.2 0 0 1-1.4 2.6l-.6.5a1.6 1.6 0 0 1-1.9 0l-.6-.5a3.2 3.2 0 0 1-1.4-2.6V6.6Z" />
      {/* eyes */}
      <circle cx="11" cy="9.9" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="9.9" r="0.8" fill="currentColor" stroke="none" />
      {/* beard */}
      <path d="M12 15v3.4" />
    </svg>
  );
}
