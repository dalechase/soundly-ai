import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreatorSetupCard({ setup }) {
  return (
    <Link
      to={`/creator-setups/${setup.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:border-violet/45 hover:bg-white/[0.07] hover:shadow-violet sm:grid-cols-[180px_1fr]"
    >
      <div className="relative min-h-44 overflow-hidden bg-panel">
        <img className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" src={setup.image} alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/10 px-3 py-1 text-xs font-semibold text-violet">
            <Sparkles size={14} />
            Creator Setup
          </span>
          <ArrowUpRight className="text-white/35 transition group-hover:text-violet" size={18} />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-white">{setup.name}</h3>
        <p className="mt-3 text-sm leading-6 text-white/64">{setup.soundGoal}</p>
      </div>
    </Link>
  );
}
