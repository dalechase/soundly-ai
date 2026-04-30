import { ArrowUpRight, Gauge, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { amazonSearchUrl, getProductById, kitSearchQuery } from '../data/mockData';

export default function GearKitCard({ kit, featured = false }) {
  const kitProducts = kit.products.map(getProductById).filter(Boolean);

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07] ${
        featured ? 'border-neon/45 shadow-glow' : 'border-white/10 hover:border-neon/40 hover:shadow-glow'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-panel">
        <img className="h-full w-full object-cover opacity-95 transition duration-500 group-hover:scale-105" src={kit.image} alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-neon ring-1 ring-neon/25">
            {kit.estimatedPrice}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-white/78 ring-1 ring-white/10">
            <Gauge size={13} />
            {kit.difficulty}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold text-white">{kit.name}</h3>
          <PackageCheck className="shrink-0 text-neon" size={21} />
        </div>
        <p className="mt-3 text-sm leading-6 text-white/64">{kit.whyItWorks}</p>
        <div className="mt-5 space-y-2">
          {kitProducts.slice(0, 4).map((product, index) => (
            <div key={product.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon/10 text-xs font-bold text-neon">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-white/78">{product.typeLabel}</span>
                <span className="block text-xs text-white/42">{product.category}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <a
            href={amazonSearchUrl(kitSearchQuery(kit))}
            target="_blank"
            rel="noreferrer sponsored"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-4 py-3 text-sm font-bold text-ink transition hover:bg-white"
          >
            Search Kit
            <ArrowUpRight size={16} />
          </a>
          <Link
            to={`/gear-kits#${kit.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-white/35 hover:bg-white/[0.08]"
          >
            Kit Details
          </Link>
        </div>
      </div>
    </article>
  );
}
