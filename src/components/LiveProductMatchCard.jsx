import { ArrowUpRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { amazonSearchUrl } from '../data/mockData';

const imageRules = [
  ['microphone', '/assets/product-microphone.png'],
  ['mic', '/assets/product-microphone.png'],
  ['headphone', '/assets/product-headphones.png'],
  ['interface', '/assets/product-interface.png'],
  ['midi', '/assets/product-midi.png'],
  ['controller', '/assets/product-midi.png'],
  ['monitor', '/assets/product-monitors.png'],
  ['speaker', '/assets/product-monitors.png'],
  ['acoustic', '/assets/product-treatment.png'],
  ['booth', '/assets/product-treatment.png'],
  ['isolation', '/assets/product-treatment.png'],
  ['treatment', '/assets/product-treatment.png'],
  ['foam', '/assets/product-treatment.png'],
  ['capture', '/assets/product-capture.png'],
  ['camera', '/assets/product-capture.png'],
  ['card', '/assets/product-capture.png'],
  ['software', '/assets/product-software.png'],
  ['sample', '/assets/product-software.png'],
  ['plugin', '/assets/product-software.png'],
  ['cable', '/assets/product-cables.png'],
  ['xlr', '/assets/product-cables.png'],
  ['trs', '/assets/product-cables.png'],
  ['stand', '/assets/product-stand.png'],
  ['boom', '/assets/product-stand.png'],
  ['light', '/assets/product-lighting.png'],
  ['pop filter', '/assets/product-pop-filter.png'],
  ['console', '/assets/product-signal.png'],
  ['mixer', '/assets/product-signal.png'],
  ['stream', '/assets/product-signal.png'],
];

function imageForMatch(match) {
  const haystack = [match.name, match.category, match.searchQuery].filter(Boolean).join(' ').toLowerCase();
  return imageRules.find(([keyword]) => haystack.includes(keyword))?.[1] || '/assets/product-signal.png';
}

export default function LiveProductMatchCard({ match }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:border-neon/40 hover:bg-white/[0.07] hover:shadow-glow">
      <div className="relative aspect-[4/3] overflow-hidden bg-panel">
        <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={imageForMatch(match)} alt="" />
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-ink/72 px-3 py-1 text-xs font-semibold text-white/76 backdrop-blur">
          {match.category}
        </div>
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-ink/72 px-3 py-1 text-xs font-bold text-neon ring-1 ring-neon/25">
          <CheckCircle2 size={13} />
          Good fit
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-neon">
              <ShoppingBag size={13} />
              Live Match
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-white">{match.name}</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">{match.bestFor}</p>
          </div>
          <span className="shrink-0 rounded-full bg-neon/10 px-3 py-1 text-sm font-bold text-neon">{match.priceBand}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-white/58">{match.whyMatched}</p>

        {match.trendName && (
          <div className="mt-4 rounded-xl border border-white/10 bg-ink/45 p-3 text-xs leading-5 text-white/52">
            Matched from <span className="font-semibold text-white/78">{match.trendName}</span>
          </div>
        )}

        <a
          href={amazonSearchUrl(match.searchQuery)}
          target="_blank"
          rel="noreferrer sponsored"
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-neon"
        >
          Search Amazon
          <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  );
}
