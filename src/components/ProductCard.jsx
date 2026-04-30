import { ArrowUpRight, Check, Minus, Radio, Star } from 'lucide-react';
import { amazonSearchUrl, productSearchQuery } from '../data/mockData';

export default function ProductCard({ product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:border-neon/40 hover:bg-white/[0.07] hover:shadow-glow">
      <div className="relative aspect-[4/3] overflow-hidden bg-panel">
        <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.image} alt={product.typeLabel || product.name} />
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-ink/72 px-3 py-1 text-xs font-semibold text-white/76 backdrop-blur">
          {product.category}
        </div>
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-ink/72 px-3 py-1 text-xs font-bold text-amber ring-1 ring-amber/25">
          <Star size={13} fill="currentColor" />
          {product.rating}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{product.name}</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-neon">{product.typeLabel}</p>
            <p className="mt-2 text-sm leading-6 text-white/62">{product.bestFor}</p>
          </div>
          <span className="rounded-full bg-neon/10 px-3 py-1 text-sm font-bold text-neon">{product.price}</span>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-ink/45 p-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/38">
            <Radio size={14} />
            Role in setup
          </div>
          <p className="mt-2 text-sm leading-6 text-white/66">{product.setupRole}</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neon">Pros</div>
            <ul className="mt-2 space-y-2">
              {product.pros.slice(0, 2).map((item) => (
                <li key={item} className="flex gap-2 text-sm text-white/65">
                  <Check className="mt-0.5 shrink-0 text-neon" size={15} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Cons</div>
            <ul className="mt-2 space-y-2">
              {product.cons.slice(0, 2).map((item) => (
                <li key={item} className="flex gap-2 text-sm text-white/65">
                  <Minus className="mt-0.5 shrink-0 text-coral" size={15} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href={amazonSearchUrl(productSearchQuery(product))}
          target="_blank"
          rel="noreferrer sponsored"
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-neon"
        >
          Search on Amazon
          <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  );
}
