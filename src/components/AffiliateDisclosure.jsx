export default function AffiliateDisclosure({ compact = false }) {
  return (
    <div
      className={`border border-amber/25 bg-amber/10 text-amber ${
        compact ? 'rounded-lg px-3 py-2 text-xs' : 'rounded-xl px-4 py-3 text-sm'
      }`}
    >
      As an Amazon Associate, Sound.ly may earn from qualifying purchases.
    </div>
  );
}
