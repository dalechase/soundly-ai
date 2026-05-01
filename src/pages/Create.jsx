import {
  AlertTriangle,
  Download,
  Loader2,
  Pause,
  Play,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  audioExtensionFor,
  audioSourceFor,
  defaultSettings,
  generationKinds,
  moodPresets,
  stylePresets,
  useAudioStore,
} from '../lib/audioStore';

const launchedRequests = new Set();

function cleanSettings(settings = {}) {
  return {
    kind: generationKinds.some((kind) => kind.id === settings.kind) ? settings.kind : defaultSettings.kind,
    prompt: String(settings.prompt || defaultSettings.prompt),
    style: String(settings.style || defaultSettings.style),
    mood: String(settings.mood || defaultSettings.mood),
  };
}

function Waveform({ peaks = [], active = false, compact = false, mini = false }) {
  const count = mini ? 22 : compact ? 34 : 72;
  const bars = peaks.length ? peaks.slice(0, count) : Array.from({ length: count }, (_, index) => 0.18 + ((index * 17) % 33) / 60);
  const sizeClass = mini ? 'h-9 w-28 gap-0.5 p-1.5' : compact ? 'h-14 gap-1 p-2' : 'h-28 gap-1 p-3';
  return (
    <div className={`flex shrink-0 items-end overflow-hidden rounded-md border border-white/10 bg-white/5 ${sizeClass}`}>
      {bars.map((peak, index) => (
        <span
          key={`${peak}-${index}`}
          className={`flex-1 rounded-t bg-[linear-gradient(180deg,rgba(255,204,102,0.92),rgba(56,189,248,0.78))] ${active ? 'animate-wave' : ''}`}
          style={{
            height: `${Math.round(18 + peak * 78)}%`,
            animationDelay: `${index * 28}ms`,
          }}
        />
      ))}
    </div>
  );
}

function RecentGenerationItem({
  creation,
  currentCreation,
  isPlaying,
  playCreation,
  togglePlay,
  remixFromCreation,
  deleteCreation,
}) {
  const source = audioSourceFor(creation);
  const isCurrent = currentCreation?.id === creation.id;
  const isActive = isCurrent && isPlaying;

  function playItem() {
    if (isCurrent) {
      togglePlay();
      return;
    }
    playCreation(creation.id);
  }

  return (
    <article className="grid gap-3 rounded-md border border-white/10 bg-white/5 p-3">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-medium text-white">{creation.title}</h3>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={playItem}
            disabled={!source}
            className="group relative grid h-9 w-9 place-items-center overflow-hidden rounded-md bg-white text-[#08101b] transition hover:bg-amber disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={isActive ? `Pause ${creation.title}` : `Play ${creation.title}`}
          >
            {isActive ? (
              <>
                <span className="flex h-4 w-4 items-end justify-center gap-0.5 transition-opacity group-hover:opacity-0" aria-hidden="true">
                  {[0.42, 0.72, 0.54, 0.9].map((height, index) => (
                    <span
                      key={height}
                      className="w-0.5 origin-bottom rounded-full bg-[#08101b] animate-wave"
                      style={{
                        height: `${height * 100}%`,
                        animationDelay: `${index * 90}ms`,
                      }}
                    />
                  ))}
                </span>
                <Pause className="absolute opacity-0 transition-opacity group-hover:opacity-100" size={15} fill="currentColor" />
              </>
            ) : (
              <Play size={15} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={() => remixFromCreation(creation)}
            className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-xs font-black text-blue-50/80 transition hover:border-amber/30 hover:bg-white/10 hover:text-white"
          >
            Remix
          </button>
          <a
            className={`grid h-9 w-9 place-items-center rounded-md border border-white/10 transition ${
              source ? 'bg-white/5 text-blue-50/80 hover:border-amber/30 hover:bg-white/10 hover:text-white' : 'pointer-events-none text-blue-50/25'
            }`}
            href={source || undefined}
            download={`soundly-${creation.kind}-${creation.id}.${audioExtensionFor(creation)}`}
            aria-label={`Download ${creation.title}`}
          >
            <Download size={15} />
          </a>
          <button
            type="button"
            onClick={() => deleteCreation(creation.id)}
            className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/5 text-blue-50/80 transition hover:border-sky/30 hover:bg-white/10 hover:text-white"
            aria-label={`Delete ${creation.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[linear-gradient(135deg,#ffcc66,#ff8a7a)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#08101b]">
            {creation.kind}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function Create() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSettings = useMemo(() => cleanSettings(location.state?.settings), [location.state?.settings]);
  const {
    creations,
    currentCreation,
    isPlaying,
    activeJob,
    generationError,
    generate,
    playCreation,
    togglePlay,
    deleteCreation,
  } = useAudioStore();
  const [settings, setSettings] = useState(initialSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState('');
  const autoLaunchedRef = useRef(false);

  const isWaiting = isGenerating || ['queued', 'running'].includes(activeJob?.status);
  const error = localError || generationError;

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  const submit = useCallback(async (event) => {
    event?.preventDefault();
    setIsGenerating(true);
    setLocalError('');
    try {
      await generate(settings);
    } catch (caughtError) {
      setLocalError(caughtError.message);
    } finally {
      setIsGenerating(false);
    }
  }, [generate, settings]);

  function remixFromCreation(creation) {
    setSettings({
      ...defaultSettings,
      kind: 'remix',
      style: creation.style,
      mood: creation.mood || 'Focused',
      prompt: `Remix "${creation.title}" with a stronger ${creation.style} pulse. Keep the core mood, add stronger drums, brighter movement, and a polished modern mix.`,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    const requestId = location.state?.requestId || '';
    if (!location.state?.autoGenerate || autoLaunchedRef.current || launchedRequests.has(requestId)) return;
    autoLaunchedRef.current = true;
    launchedRequests.add(requestId);
    submit();
  }, [location.state?.autoGenerate, location.state?.requestId, submit]);

  return (
    <main className="min-h-screen pb-40">
      <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(360px,0.86fr)_minmax(0,1.2fr)] lg:px-8">
        <form onSubmit={submit} className="rounded-md border border-white/10 bg-[rgba(9,24,44,0.88)] p-4 shadow-[0_28px_120px_rgba(56,189,248,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-amber/80">Creation</div>
              <h1 className="mt-1 font-display text-2xl font-black text-white">Build the next track</h1>
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-4 text-sm font-black text-white shadow-[0_0_34px_rgba(56,189,248,0.24)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              Create
            </button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {generationKinds.map((kind) => (
              <button
                key={kind.id}
                type="button"
                onClick={() => updateSetting('kind', kind.id)}
                className={`rounded-md border px-3 py-3 text-left transition ${
                  settings.kind === kind.id
                    ? 'border-sky/60 bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white shadow-[0_0_34px_rgba(56,189,248,0.2)]'
                    : 'border-white/10 bg-white/5 text-blue-50/65 hover:border-amber/30 hover:text-white'
                }`}
              >
                <span className="block text-sm font-black">{kind.label}</span>
              </button>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-amber/80">Prompt</span>
            <textarea
              className="mt-2 min-h-36 w-full resize-none rounded-md border border-white/10 bg-white/5 p-4 text-base font-semibold leading-7 text-white outline-none transition placeholder:text-blue-50/30 focus:border-sky/55"
              value={settings.prompt}
              onChange={(event) => updateSetting('prompt', event.target.value)}
              placeholder="Describe the song, instrumental, or remix"
            />
          </label>

          <div className="mt-4 grid gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-amber/80">Genre / Style</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {stylePresets.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => updateSetting('style', style)}
                    className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                      settings.style === style
                        ? 'border-amber/50 bg-amber text-[#08101b]'
                        : 'border-white/10 bg-white/5 text-blue-50/65 hover:border-amber/30 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-amber/80">Mood</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {moodPresets.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => updateSetting('mood', mood)}
                    className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                      settings.mood === mood
                        ? 'border-amber/50 bg-amber text-[#08101b]'
                        : 'border-white/10 bg-white/5 text-blue-50/65 hover:border-amber/30 hover:text-white'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex gap-2 rounded-md border border-amber/30 bg-amber/10 p-3 text-sm font-semibold leading-6 text-amber">
              <AlertTriangle className="mt-0.5 shrink-0" size={17} />
              {error}
            </div>
          )}
        </form>

        <section>
          <div className="rounded-md border border-white/10 bg-[rgba(9,24,44,0.88)] p-4 shadow-[0_28px_120px_rgba(56,189,248,0.1)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="mt-1 font-display text-2xl font-black text-white">Recent Generations</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/library')}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs font-black text-blue-50/80 transition hover:border-amber/30 hover:bg-white/10 hover:text-white"
              >
                <Sparkles size={15} />
                Open
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {isWaiting && (
                <article className="rounded-md border border-sky/25 bg-sky/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <Loader2 className="animate-spin text-sky" size={16} />
                        Generating audio
                      </div>
                      <p className="mt-1 truncate text-xs font-semibold text-blue-50/60">
                        {activeJob?.providerStatus || activeJob?.status || 'Preparing your track'}
                      </p>
                    </div>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-50/70">
                      {settings.kind}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Waveform active compact />
                  </div>
                </article>
              )}

              {creations.slice(0, 6).map((creation) => (
                <RecentGenerationItem
                  key={creation.id}
                  creation={creation}
                  currentCreation={currentCreation}
                  isPlaying={isPlaying}
                  playCreation={playCreation}
                  togglePlay={togglePlay}
                  remixFromCreation={remixFromCreation}
                  deleteCreation={deleteCreation}
                />
              ))}

              {!creations.length && !isWaiting && (
                <div className="rounded-md border border-white/10 bg-white/5 p-5 text-sm font-semibold leading-6 text-blue-50/65">
                  Generate a song, instrumental, or remix and it will be saved here automatically.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
