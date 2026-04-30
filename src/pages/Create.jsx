import {
  AlertTriangle,
  ChevronDown,
  Download,
  Filter,
  Gauge,
  Loader2,
  MoreHorizontal,
  Play,
  Search,
  Shuffle,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Wand2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const launchedRequests = new Set();

const stylePresets = ['R&B', 'Hip Hop', 'Trap Soul', 'Boom Bap', 'Lo-fi', 'Drill'];
const inspiration = ['soulful keys', 'vinyl swing', '808 glide', 'dusty drums', 'late night', 'warm Rhodes', 'tight hats', 'female vocal chop'];
const idlePeaks = [0.2, 0.45, 0.28, 0.68, 0.5, 0.8, 0.36, 0.58, 0.72, 0.34, 0.6, 0.42, 0.78, 0.3, 0.54, 0.66];

const defaultSettings = {
  mode: 'music',
  prompt: 'Smooth modern R&B instrumental, warm Rhodes, deep 808, tight drums, late night mood, no lead vocal',
  style: 'R&B',
  duration: 16,
  intensity: 7,
  loopable: true,
};

const seedRows = [
  {
    title: 'Midnight Rhodes',
    subtitle: 'Smooth R&B instrumental with deep 808 and pocket drums',
    style: 'R&B',
    duration: '1:00',
    image: '/assets/product-software.png',
  },
  {
    title: 'Dusty Crate Bounce',
    subtitle: 'Boom bap loop with chopped soul keys and round bass',
    style: 'Boom Bap',
    duration: '1:00',
    image: '/assets/product-capture.png',
  },
  {
    title: 'Blue Room 808',
    subtitle: 'Trap soul beat with airy pads and sliding bass',
    style: 'Trap Soul',
    duration: '1:00',
    image: '/assets/product-midi.png',
  },
  {
    title: 'Pocket Break',
    subtitle: 'Loopable hip hop drum groove with crisp hats',
    style: 'Hip Hop',
    duration: '0:32',
    image: '/assets/product-signal.png',
  },
  {
    title: 'After Hours Drill',
    subtitle: 'Sparse piano melody loop with tense bells',
    style: 'Drill',
    duration: '0:45',
    image: '/assets/product-headphones.png',
  },
];

function cleanSettings(settings = {}) {
  return {
    ...defaultSettings,
    ...settings,
    prompt: String(settings.prompt || defaultSettings.prompt),
    style: String(settings.style || defaultSettings.style),
    mode: ['music', 'loop', 'sfx'].includes(settings.mode) ? settings.mode : defaultSettings.mode,
    duration: Number(settings.duration || defaultSettings.duration),
    intensity: Number(settings.intensity || defaultSettings.intensity),
    loopable: Boolean(settings.loopable ?? defaultSettings.loopable),
  };
}

function audioSourceFor(job) {
  if (!job?.result) return '';
  if (job.result.audioUrl) return job.result.audioUrl;
  if (job.result.audioBase64) return `data:${job.result.mimeType || 'audio/wav'};base64,${job.result.audioBase64}`;
  return '';
}

function audioExtensionFor(job) {
  const mimeType = job?.result?.mimeType || '';
  if (mimeType.includes('flac')) return 'flac';
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
  return 'wav';
}

function formatDuration(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return '--';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Create() {
  const location = useLocation();
  const initialSettings = useMemo(() => cleanSettings(location.state?.settings), [location.state?.settings]);
  const [mode, setMode] = useState(initialSettings.mode);
  const [prompt, setPrompt] = useState(initialSettings.prompt);
  const [style, setStyle] = useState(initialSettings.style);
  const [duration, setDuration] = useState(initialSettings.duration);
  const [intensity, setIntensity] = useState(initialSettings.intensity);
  const [loopable, setLoopable] = useState(initialSettings.loopable);
  const [job, setJob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [audioStatus, setAudioStatus] = useState(null);
  const autoLaunchedRef = useRef(false);

  const audioSource = audioSourceFor(job);
  const audioExtension = audioExtensionFor(job);
  const isWaiting = isGenerating || ['queued', 'running'].includes(job?.status);
  const currentTitle = job?.status === 'completed' ? 'Sound.ly Generation' : isWaiting ? 'Generating new track' : 'Ready to create';
  const taskLabel = job?.externalTaskId ? `${job.route || 'task'} ${job.externalTaskId}` : '';
  const providerLabel = job?.result?.provider || job?.providerStatus || job?.status || (audioStatus?.murekaConfigured ? 'mureka' : 'ready');
  const peaks = useMemo(() => {
    const source = job?.result?.previewPeaks?.length ? job.result.previewPeaks : idlePeaks;
    return Array.from({ length: 64 }, (_, index) => source[index % source.length]);
  }, [job]);
  const rows = useMemo(() => {
    const generatedRow = job
      ? [{
          title: currentTitle,
          subtitle: prompt,
          style,
          duration: formatDuration(job.result?.duration || duration),
          image: '/assets/soundly-hero.png',
          live: true,
        }]
      : [];
    return [...generatedRow, ...seedRows];
  }, [currentTitle, duration, job, prompt, style]);

  useEffect(() => {
    let cancelled = false;

    async function loadAudioStatus() {
      try {
        const response = await fetch('/api/audio/status');
        const payload = await response.json();
        if (!cancelled) setAudioStatus(payload);
      } catch {
        if (!cancelled) setAudioStatus({ ready: false });
      }
    }

    loadAudioStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const generateAudio = useCallback(async (requestedSettings) => {
    const settings = cleanSettings(requestedSettings);
    setMode(settings.mode);
    setPrompt(settings.prompt);
    setStyle(settings.style);
    setDuration(settings.duration);
    setIntensity(settings.intensity);
    setLoopable(settings.loopable);
    setIsGenerating(true);
    setError('');
    setJob(null);

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Generation failed');
      }

      let currentJob = payload.job;
      setJob(currentJob);

      while (['queued', 'running'].includes(currentJob.status)) {
        await delay(1200);
        const jobResponse = await fetch(`/api/audio/generate/${currentJob.id}`);
        const jobPayload = await jobResponse.json();
        if (!jobResponse.ok || !jobPayload.ok) {
          throw new Error(jobPayload.error || 'Could not fetch generation job');
        }
        currentJob = jobPayload.job;
        setJob(currentJob);
      }

      if (currentJob.status === 'failed') {
        throw new Error(currentJob.error || 'Generation failed');
      }
    } catch (generationError) {
      setError(generationError.message);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    const requestId = location.state?.requestId || 'direct-create-request';
    if (!location.state?.autoGenerate || autoLaunchedRef.current || launchedRequests.has(requestId)) return;
    autoLaunchedRef.current = true;
    launchedRequests.add(requestId);
    generateAudio(initialSettings);
  }, [generateAudio, initialSettings, location.state?.autoGenerate, location.state?.requestId]);

  function submitCreate(event) {
    event.preventDefault();
    generateAudio({ mode, prompt, style, duration, intensity, loopable });
  }

  return (
    <form onSubmit={submitCreate} className="grid min-h-screen border-t border-white/10 bg-[#090a0d] pb-24 lg:grid-cols-[43%_32%_25%]">
      <section className="relative border-r border-white/10 px-5 py-5 lg:min-h-[calc(100svh-88px)]">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.035] p-1">
            <button type="button" className="h-9 rounded-full bg-white px-4 text-xs font-black text-ink">Simple</button>
            <button type="button" className="h-9 rounded-full px-4 text-xs font-black text-white/50">Advanced</button>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-black text-white/62">
            {audioStatus?.murekaConfigured ? 'mureka' : 'fallback'}
          </div>
        </div>

        <div className="mt-7 rounded-xl border border-white/10 bg-[#17181c] p-5">
          <div className="flex items-start justify-between gap-4">
            <label className="block flex-1">
              <span className="text-sm font-black text-white/72">Song Description</span>
              <textarea
                className="mt-5 min-h-32 w-full resize-none bg-transparent text-sm font-semibold leading-6 text-white outline-none placeholder:text-white/28"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe the song you want to make"
              />
            </label>
            <button type="button" className="mt-8 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/66">
              <Wand2 size={17} />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {['Audio', 'Lyrics'].map((item) => (
                <button key={item} type="button" className="inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-xs font-black text-white/72">
                  <span className="text-lg leading-none">+</span>
                  {item}
                </button>
              ))}
            </div>
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-pink-500"
                checked={loopable && mode !== 'sfx'}
                disabled={mode === 'sfx'}
                onChange={(event) => setLoopable(event.target.checked)}
              />
              Instrumental
            </label>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="text-sm font-bold text-white/34">Inspiration</div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {inspiration.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="shrink-0 rounded-full bg-white/[0.06] px-3 py-2 text-xs font-black text-white/68 hover:bg-white/10"
                  onClick={() => setPrompt(`${prompt}, ${item}`)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 md:grid-cols-2">
          <label className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            <span className="flex items-center gap-2">
              <Timer size={15} />
              Duration {duration}s
            </span>
            <input className="mt-3 w-full accent-pink-500" type="range" min="2" max="30" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
          </label>
          <label className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            <span className="flex items-center gap-2">
              <Gauge size={15} />
              Energy {intensity}
            </span>
            <input className="mt-3 w-full accent-pink-500" type="range" min="1" max="10" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {stylePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`rounded-full px-3 py-2 text-xs font-black transition ${
                style === preset ? 'bg-white text-ink' : 'bg-white/[0.055] text-white/50 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setStyle(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">
            {error}
          </div>
        )}

        <div className="sticky bottom-24 mt-10 flex items-center gap-4 pt-8">
          <button type="button" className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/72">
            <X size={18} />
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f97316,#ec4899,#f97316)] text-sm font-black text-white shadow-[0_18px_50px_rgba(236,72,153,0.28)] hover:brightness-110 disabled:cursor-wait disabled:opacity-65"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Create
          </button>
        </div>
      </section>

      <section className="border-r border-white/10 px-4 py-5">
        <div className="flex items-center gap-1 text-sm font-black text-white/86">
          Workspaces <span className="text-white/24">›</span> <span className="text-white/48">My Workspace</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <label className="flex h-10 min-w-44 flex-1 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-sm font-semibold text-white/48">
            <Search size={16} />
            <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/38" placeholder="Search" />
          </label>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/74">
            <Filter size={15} />
            Filters
            <ChevronDown size={14} />
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/74">
            Newest
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {rows.map((row, index) => (
            <article key={`${row.title}-${index}`} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.04]">
              <div className="h-2 w-2 shrink-0 rounded-full bg-pink-500" />
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <img className="h-full w-full object-cover" src={row.image} alt="" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                  {row.live && isWaiting ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-black text-white">{row.title}</h2>
                  <span className="rounded bg-pink-500/18 px-1.5 py-0.5 text-[10px] font-black text-pink-300">{row.style}</span>
                </div>
                <p className="mt-1 truncate text-xs font-semibold text-white/38">{row.subtitle}</p>
                <div className="mt-2 flex items-center gap-2 text-white/34">
                  <ThumbsUp size={14} />
                  <ThumbsDown size={14} />
                  <Shuffle size={14} />
                </div>
              </div>
              <div className="text-xs font-black text-white/38">{row.duration}</div>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white/40 opacity-0 transition group-hover:opacity-100">
                <MoreHorizontal size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <aside className="hidden px-4 py-5 xl:block">
        <div className="sticky top-5 min-h-[calc(100svh-136px)] rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(255,255,255,0.04)_38%,rgba(37,99,235,0.08))] p-4">
          <button type="button" className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white/70">
            <X size={18} />
          </button>
          <img className="mx-auto mt-1 h-32 w-32 rounded-2xl object-cover" src="/assets/soundly-hero.png" alt="" />
          <div className="mt-4 flex justify-center gap-2">
            {[Play, ThumbsUp, MoreHorizontal].map((Icon, index) => (
              <button key={index} type="button" className="inline-flex h-8 min-w-12 items-center justify-center gap-1 rounded-full bg-white/[0.08] text-xs font-black text-white">
                <Icon size={14} fill={Icon === Play ? 'currentColor' : 'none'} />
                {index === 0 ? 1 : 0}
              </button>
            ))}
          </div>

          <h2 className="mt-5 text-xl font-black text-white">{currentTitle}</h2>
          <button type="button" className="mt-5 h-12 w-full rounded-xl bg-white/[0.08] text-sm font-black text-white hover:bg-white/12">
            Remix/Edit
          </button>

          <div className="mt-4 rounded-xl bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/62">{style.toLowerCase()}, {mode}</div>
            <button type="button" className="mt-4 text-xs font-black text-white">Show More <ChevronDown className="inline" size={13} /></button>
          </div>

          <div className="mt-4 text-sm font-semibold leading-6 text-white/58">
            [{loopable && mode !== 'sfx' ? 'Instrumental' : mode.toUpperCase()}]
          </div>
          <div className="mt-3 text-xs font-bold text-white/35">{taskLabel || providerLabel}</div>
          {audioSource && (
            <a
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-black text-ink hover:bg-sky"
              href={audioSource}
              download={`soundly-${mode}-${job?.id || 'preview'}.${audioExtension}`}
            >
              <Download size={16} />
              Download
            </a>
          )}
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#171717]/95 backdrop-blur-xl lg:left-60">
        <div className="grid gap-3 px-4 py-3 lg:grid-cols-[1fr_1.2fr_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <img className="h-11 w-11 rounded-md object-cover" src="/assets/soundly-hero.png" alt="" />
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-white">{currentTitle}</div>
              <div className="truncate text-xs font-semibold text-white/42">{providerLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="hidden text-white/34 md:block"><Shuffle size={17} /></button>
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink">
              {isWaiting ? <Loader2 className="animate-spin" size={19} /> : <Play size={18} fill="currentColor" />}
            </button>
            <div className="hidden h-8 flex-1 items-end gap-0.5 md:flex">
              {peaks.map((peak, index) => (
                <span key={`${peak}-${index}`} className={`flex-1 rounded-t-sm bg-white/40 ${isWaiting ? 'animate-pulse' : ''}`} style={{ height: `${Math.round(14 + peak * 78)}%` }} />
              ))}
            </div>
            <div className="text-xs font-black text-white/38">{formatDuration(job?.result?.duration || duration)}</div>
          </div>

          {audioSource ? (
            <audio className="w-full max-w-sm" controls src={audioSource} />
          ) : (
            <div className="hidden h-10 min-w-64 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white/32 lg:flex">
              {isWaiting ? 'Waiting for generated audio' : 'Audio player'}
            </div>
          )}
        </div>
      </div>

      {!audioStatus?.ready && (
        <div className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-2 text-xs font-black text-amber">
          <AlertTriangle size={14} />
          Offline
        </div>
      )}
    </form>
  );
}
