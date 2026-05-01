import { Download, Play, RefreshCw, Search, Trash2, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioExtensionFor, audioSourceFor, useAudioStore } from '../lib/audioStore';

export default function Library() {
  const navigate = useNavigate();
  const { creations, playCreation, deleteCreation, refreshLibrary } = useAudioStore();
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredCreations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return creations.filter((creation) => {
      const matchesKind = kindFilter === 'all' || creation.kind === kindFilter;
      const haystack = `${creation.title} ${creation.prompt} ${creation.style} ${creation.mood}`.toLowerCase();
      return matchesKind && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [creations, kindFilter, query]);

  async function refresh() {
    setRefreshing(true);
    try {
      await refreshLibrary();
    } finally {
      setRefreshing(false);
    }
  }

  function remix(creation) {
    navigate('/create', {
      state: {
        settings: {
          kind: 'remix',
          prompt: `Remix "${creation.title}" into a fresh ${creation.style} version with stronger momentum, new drums, and a clean modern mix.`,
          style: creation.style,
          mood: creation.mood,
        },
      },
    });
  }

  return (
    <main className="min-h-screen pb-40">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-blue-200/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-sky">Library</div>
            <h1 className="mt-2 font-display text-4xl font-black text-white">Saved creations</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-100/58">
              Every generated track is stored with the prompt and controls that produced it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-500 px-4 text-sm font-black text-white shadow-glow transition hover:bg-blue-400"
          >
            <Wand2 size={17} />
            New Creation
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <label className="flex h-11 items-center gap-3 rounded-md border border-blue-200/10 bg-blue-950/45 px-3 text-blue-100/58">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-blue-100/35"
              placeholder="Search prompts, styles, moods"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'song', 'instrumental', 'remix'].map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setKindFilter(kind)}
                className={`h-11 shrink-0 rounded-md border px-3 text-xs font-black capitalize transition ${
                  kindFilter === kind
                    ? 'border-sky bg-sky text-blue-950'
                    : 'border-blue-200/10 bg-blue-950/45 text-blue-100/58 hover:text-white'
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-blue-300/20 bg-blue-950/45 px-3 text-xs font-black text-blue-100 transition hover:bg-blue-900"
          >
            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
            Refresh
          </button>
        </div>

        <section className="mt-5 grid gap-3">
          {filteredCreations.map((creation) => {
            const source = audioSourceFor(creation);
            return (
              <article key={creation.id} className="grid gap-4 rounded-md border border-blue-200/10 bg-[#071a33] p-4 shadow-glow xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                      {creation.kind}
                    </span>
                    <span className="rounded-md border border-blue-200/10 bg-blue-950/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-100/58">
                      {creation.style}
                    </span>
                  </div>
                  <h2 className="mt-3 truncate font-display text-2xl font-black text-white">{creation.title}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-blue-100/62">{creation.prompt}</p>
                </div>

                <div className="grid gap-3">
                  <div className="flex h-16 items-end gap-1 rounded-md border border-blue-200/10 bg-blue-950/35 p-2">
                    {(creation.result?.previewPeaks?.length ? creation.result.previewPeaks : Array.from({ length: 40 }, (_, index) => 0.12 + ((index * 13) % 30) / 60)).slice(0, 44).map((peak, index) => (
                      <span key={`${creation.id}-${index}`} className="flex-1 rounded-t bg-sky/70" style={{ height: `${Math.round(18 + peak * 78)}%` }} />
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => playCreation(creation.id)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-xs font-black text-blue-950 transition hover:bg-blue-100"
                    >
                      <Play size={15} fill="currentColor" />
                      Play
                    </button>
                    <button
                      type="button"
                      onClick={() => remix(creation)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-300/20 bg-blue-950/45 px-3 text-xs font-black text-blue-100 transition hover:bg-blue-900"
                    >
                      Remix
                    </button>
                    <a
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-xs font-black transition ${
                        source ? 'bg-blue-500 text-white hover:bg-blue-400' : 'pointer-events-none bg-blue-900/60 text-blue-100/25'
                      }`}
                      href={source || undefined}
                      download={`soundly-${creation.kind}-${creation.id}.${audioExtensionFor(creation)}`}
                    >
                      <Download size={15} />
                      Save
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteCreation(creation.id)}
                      className="grid h-10 w-10 place-items-center rounded-md border border-blue-300/20 bg-blue-950/45 text-blue-100 transition hover:bg-blue-900"
                      aria-label={`Delete ${creation.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {!filteredCreations.length && (
            <div className="rounded-md border border-blue-200/10 bg-[#071a33] p-8 text-center shadow-glow">
              <h2 className="font-display text-2xl font-black text-white">No creations found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-blue-100/58">
                Generate a new song, instrumental, or remix and it will be saved with its original prompt.
              </p>
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-500 px-4 text-sm font-black text-white shadow-glow transition hover:bg-blue-400"
              >
                <Wand2 size={17} />
                Create Audio
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
