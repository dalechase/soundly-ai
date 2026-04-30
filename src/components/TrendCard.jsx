import { ArrowRight, Flame, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrendCard({ trend }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-neon/35 hover:bg-white/[0.07] hover:shadow-glow">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
          <Flame size={14} />
          Rising {trend.velocity}
        </span>
        <h3 className="mt-5 font-display text-xl font-semibold text-white">{trend.name}</h3>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/64">{trend.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {trend.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/58">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-3 rounded-xl border border-white/10 bg-ink/40 p-3 text-sm text-white/66">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/36">
            <Wand2 size={14} />
            Prompt starter
          </div>
          <div className="mt-2 font-semibold text-white">Generate a {trend.name.toLowerCase()} variation</div>
        </div>
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-neon"
        >
          Open Generator
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
