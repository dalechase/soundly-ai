import { ArrowUpRight, RefreshCw, Satellite, Search, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { amazonSearchUrl } from '../data/mockData';

function formatTime(value) {
  if (!value) return 'Not scanned yet';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function LiveTrendPanel({ compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadLiveTrends(refresh = false) {
    setLoading(true);
    setError(null);

    try {
      const endpoint = refresh ? '/api/live/trends/refresh' : '/api/live/trends';
      const response = await fetch(endpoint, {
        method: refresh ? 'POST' : 'GET',
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Live trend scan failed');
      }
      setData(payload);
    } catch (liveError) {
      setError(liveError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLiveTrends(false);
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-neon">{compact ? 'Fresh Sounds' : 'Live Trend Intel'}</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white">
            {compact ? 'Sounds people are building right now' : 'Live audio signals from the web'}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
            {compact
              ? 'A fresh scan of creator audio trends, translated into practical gear searches.'
              : 'OpenAI web search scans current creator and audio signals, then shapes them into gear-aware opportunities for Sound.ly.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadLiveTrends(true)}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neon/25 bg-neon/10 px-4 text-sm font-bold text-neon transition hover:bg-neon hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={17} />
          {loading ? 'Scanning' : 'Refresh Scan'}
        </button>
      </div>

      {!compact && (
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/46">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            <Satellite size={14} />
            {data?.provider || 'openai-responses-web-search'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {data?.cached ? 'Cached scan' : 'Fresh scan'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {formatTime(data?.generatedAt)}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-coral/25 bg-coral/10 p-4 text-sm leading-6 text-coral">
          {error}
        </div>
      )}

      {data?.summary && <p className="mt-6 max-w-4xl text-base leading-7 text-white/68">{data.summary}</p>}

      {!compact && !!data?.sources?.length && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/38">Source scan</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.sources.slice(0, compact ? 5 : 10).map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-ink/40 px-3 py-1.5 text-xs font-semibold text-white/56 transition hover:border-neon/35 hover:text-neon"
              >
                <span className="truncate">{source.title}</span>
                <ArrowUpRight className="shrink-0" size={13} />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        {(data?.trends || []).map((trend) => (
          <article key={trend.name} className="rounded-2xl border border-white/10 bg-ink/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-white">{trend.name}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{trend.description}</p>
              </div>
              <div className="shrink-0 rounded-full border border-neon/20 bg-neon/10 px-3 py-1 text-xs font-bold text-neon">
                {trend.velocity}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/36">Sound goal</div>
                <div className="mt-2 text-sm leading-6 text-white/70">{trend.soundGoal}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/36">Content angle</div>
                <div className="mt-2 text-sm leading-6 text-white/70">{trend.contentAngle}</div>
              </div>
            </div>

            {!!trend.relatedProducts?.length && (
              <div className="mt-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/36">
                  <ShoppingBag size={14} />
                  Matched searches
                </div>
                <div className="mt-2 divide-y divide-white/10 rounded-xl border border-white/10">
                  {trend.relatedProducts.slice(0, compact ? 2 : 4).map((match) => (
                    <a
                      key={`${trend.name}-${match.name}`}
                      href={amazonSearchUrl(match.searchQuery)}
                      target="_blank"
                      rel="noreferrer sponsored"
                      className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition hover:bg-white/[0.045]"
                    >
                      <span>
                        <span className="block font-semibold text-white/76">{match.name}</span>
                        <span className="block text-xs text-white/42">{match.category} | {match.priceBand}</span>
                      </span>
                      <ArrowUpRight className="shrink-0 text-neon" size={14} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={amazonSearchUrl(trend.amazonSearchQuery)}
                target="_blank"
                rel="noreferrer sponsored"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-4 py-3 text-sm font-bold text-ink transition hover:bg-white"
              >
                <Search size={16} />
                Amazon Search
              </a>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(trend.name + ' audio trend')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-white/78 transition hover:border-white/35 hover:bg-white/[0.06]"
              >
                Research Trend
                <ArrowUpRight size={16} />
              </a>
            </div>

            {!!trend.evidence?.length && (
              <div className="mt-5 space-y-2">
                {trend.evidence.slice(0, compact ? 1 : 3).map((source) => (
                  <a
                    key={`${trend.name}-${source.url}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-white/54 transition hover:border-neon/30 hover:text-white/74"
                  >
                    <span className="font-semibold text-white/76">{source.title}</span>
                    <span className="mt-1 block">{source.note}</span>
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {loading && !data && (
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
          ))}
        </div>
      )}
    </section>
  );
}
