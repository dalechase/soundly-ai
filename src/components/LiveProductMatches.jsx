import { RefreshCw, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LiveProductMatchCard from './LiveProductMatchCard';

export default function LiveProductMatches({ limit = 9 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadProductMatches(refresh = false) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(refresh ? '/api/live/trends/refresh' : '/api/live/trends', {
        method: refresh ? 'POST' : 'GET',
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Live product matching failed');
      }
      setData(payload);
    } catch (productError) {
      setError(productError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProductMatches(false);
  }, []);

  const matches = useMemo(
    () =>
      (data?.trends || [])
        .flatMap((trend) =>
          (trend.relatedProducts || []).map((match, index) => ({
            ...match,
            id: `${trend.name}-${match.name}-${index}`,
            trendName: trend.name,
            trendScore: trend.popularityScore,
          })),
        )
        .sort((a, b) => b.trendScore + b.matchConfidence - (a.trendScore + a.matchConfidence))
        .slice(0, limit),
    [data, limit],
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-neon">
            <ShoppingBag size={16} />
            Fresh Gear Ideas
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white">Products matched to what creators are making</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
            Sound.ly turns current sound trends into practical Amazon searches. For now, these are category matches rather than exact Amazon listings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadProductMatches(true)}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neon/25 bg-neon/10 px-4 text-sm font-bold text-neon transition hover:bg-neon hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={17} />
          {loading ? 'Matching' : 'Refresh Matches'}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-coral/25 bg-coral/10 p-4 text-sm leading-6 text-coral">
          {error}
        </div>
      )}

      <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <LiveProductMatchCard key={match.id} match={match} />
        ))}
      </div>

      {loading && !matches.length && (
        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-96 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
          ))}
        </div>
      )}
    </section>
  );
}
