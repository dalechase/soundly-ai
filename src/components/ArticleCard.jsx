import { ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-neon/45 hover:bg-white/[0.07] hover:shadow-glow"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neon/10 text-neon">
          <FileText size={19} />
        </span>
        <ArrowUpRight className="text-white/40 transition group-hover:text-neon" size={19} />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{article.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/62">{article.intro}</p>
      <div className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.18em] text-neon">
        Buying Guide
      </div>
    </Link>
  );
}
