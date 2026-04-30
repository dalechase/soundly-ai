import { ArrowUpRight, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { amazonSearchUrl } from '../data/mockData';

export default function AmazonResolverPanel() {
  const [query, setQuery] = useState('dynamic broadcast microphone clean podcast voice');
  const searchUrl = amazonSearchUrl(query);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-neon">Amazon Search Fallback</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white">Affiliate search link generator</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
            Generates tagged Amazon search URLs while the Creators API account is waiting on approval. No API call or ASIN lookup required.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-neon/25 bg-neon/10 px-3 py-2 text-sm font-semibold text-neon">
          <ShieldCheck size={17} />
          No API required
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="amazon-query">
          Amazon search query
        </label>
        <input
          id="amazon-query"
          className="min-h-12 rounded-xl border border-white/10 bg-ink/60 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-neon/50"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for audio gear"
        />
        <a
          href={searchUrl}
          target="_blank"
          rel="noreferrer sponsored"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neon px-5 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search size={17} />
          Open Amazon Search
          <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-neon/25 bg-neon/10 p-5">
          <Sparkles className="text-neon" size={22} />
          <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-neon">Live buying path</div>
          <div className="mt-2 font-display text-2xl font-bold text-white">Amazon search</div>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Good enough for launch: send users to a relevant, tagged Amazon result page and replace with exact ASIN URLs after API approval.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink/45 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">Generated URL</div>
          <div className="mt-3 break-all rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/66">
            {searchUrl}
          </div>
          <div className="mt-4 text-xs leading-5 text-white/42">
            This uses `tag=inet9tv-20` and does not require product API eligibility.
          </div>
        </div>
      </div>
    </section>
  );
}
