import {
  AlertTriangle,
  AudioWaveform,
  Check,
  Download,
  Gauge,
  Loader2,
  Music,
  Play,
  Plus,
  SlidersHorizontal,
  Timer,
  Wand2,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const modes = [
  {
    id: 'music',
    label: 'Song',
    icon: Music,
    placeholder: 'Smooth modern R&B instrumental, warm Rhodes, deep 808, tight drums, late night mood, no lead vocal',
  },
  {
    id: 'loop',
    label: 'Loop',
    icon: AudioWaveform,
    placeholder: 'Loopable hip hop drum groove, crisp hats, swung snare, warm bass, clean eight bar pocket',
  },
  {
    id: 'sfx',
    label: 'SFX',
    icon: Zap,
    placeholder: 'Producer tag style riser hit, short vinyl stop, clean tail',
  },
];

const stylePresets = ['R&B', 'Hip Hop', 'Trap Soul', 'Boom Bap', 'Lo-fi', 'Drill'];
const idlePeaks = [0.17, 0.26, 0.19, 0.56, 0.32, 0.78, 0.44, 0.35, 0.66, 0.5, 0.86, 0.6, 0.38, 0.72, 0.46, 0.25];

const promptPresets = {
  music: [
    'Smooth modern R&B instrumental, warm Rhodes, deep 808, tight drums, late night mood, no lead vocal',
    'Melodic trap soul beat, airy pads, sliding 808, crisp hats, emotional piano, instrumental hook',
    'Classic boom bap beat, dusty drums, chopped soul keys, round bassline, head nod groove, instrumental',
  ],
  loop: [
    'Loopable hip hop drum groove, crisp hats, swung snare, warm bass, clean eight bar pocket',
    'Seamless R&B chord loop, Rhodes seventh chords, soft vinyl texture, subtle percussion, no vocal',
    'Dark drill melody loop, sparse piano, tense bells, sliding bass space, clean four bar phrase',
  ],
  sfx: [
    'Producer tag style riser hit, short vinyl stop, clean tail',
    'Deep 808 impact with tight sub drop and soft tape texture',
    'Clean radio sweep transition for a hip hop beat tag',
  ],
};

const featureCards = [
  {
    label: 'R&B Suite',
    title: 'Velvet keys, tight drums, clean space.',
    copy: 'Start with Rhodes, muted bass, and late-night pocket.',
    image: '/assets/soundly-hero.png',
    prompt: promptPresets.music[0],
    mode: 'music',
    style: 'R&B',
  },
  {
    label: 'New Route',
    title: 'Mureka music generation is live.',
    copy: 'Create realistic beats, loops, and smooth instrumental beds.',
    image: '/assets/product-software.png',
    prompt: promptPresets.music[1],
    mode: 'music',
    style: 'Trap Soul',
  },
];

const collections = [
  {
    title: 'For You',
    cover: '/assets/product-capture.png',
    items: [
      ['After Hours Keys', 'Modern R&B', 'R&B', promptPresets.music[0], 'music'],
      ['Blue Room Bounce', 'Trap Soul', 'Trap Soul', promptPresets.music[1], 'music'],
      ['Dust Loop 92', 'Boom Bap', 'Boom Bap', promptPresets.loop[1], 'loop'],
    ],
  },
  {
    title: 'Beat Starters',
    cover: '/assets/product-midi.png',
    items: [
      ['808 Silk', 'Melodic Trap', 'Trap Soul', promptPresets.music[1], 'music'],
      ['Pocket Break', 'Hip Hop Loop', 'Hip Hop', promptPresets.loop[0], 'loop'],
      ['Basement Soul', 'Chopped Keys', 'Boom Bap', promptPresets.music[2], 'music'],
    ],
  },
  {
    title: 'Transitions',
    cover: '/assets/product-signal.png',
    items: [
      ['Tag Sweep', 'Producer FX', 'Hip Hop', promptPresets.sfx[0], 'sfx'],
      ['Sub Drop', '808 Impact', 'Trap Soul', promptPresets.sfx[1], 'sfx'],
      ['Radio Glide', 'Sweep FX', 'Hip Hop', promptPresets.sfx[2], 'sfx'],
    ],
  },
];

function activeMode(modeId) {
  return modes.find((mode) => mode.id === modeId) || modes[0];
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

export default function AudioGenerator() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('music');
  const [prompt, setPrompt] = useState(promptPresets.music[0]);
  const [style, setStyle] = useState('R&B');
  const [duration, setDuration] = useState(16);
  const [intensity, setIntensity] = useState(7);
  const [loopable, setLoopable] = useState(true);
  const [job, setJob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [audioStatus, setAudioStatus] = useState(null);

  const selectedMode = activeMode(mode);
  const audioSource = audioSourceFor(job);
  const audioExtension = audioExtensionFor(job);
  const generationReady = audioStatus ? Boolean(audioStatus.ready) : false;
  const workerReady = Boolean(audioStatus?.configured && audioStatus?.reachable);
  const murekaReady = Boolean(audioStatus?.murekaConfigured && mode !== 'sfx');
  const route = murekaReady ? 'Mureka' : workerReady ? 'Model worker' : mode === 'sfx' ? 'Sound.ly SFX' : 'Sound.ly Composer';
  const isWaiting = isGenerating || ['queued', 'running'].includes(job?.status);
  const taskLabel = job?.externalTaskId ? `${job.route || 'task'} ${job.externalTaskId}` : '';
  const statusLabel = job?.result?.provider || job?.providerStatus || job?.status || (generationReady ? 'ready' : 'offline');
  const peaks = useMemo(() => {
    const source = job?.result?.previewPeaks?.length ? job.result.previewPeaks : idlePeaks;
    return Array.from({ length: 54 }, (_, index) => source[index % source.length]);
  }, [job]);

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

  function applyPreset(nextPrompt, nextMode = mode, nextStyle = style) {
    setMode(nextMode);
    setPrompt(nextPrompt);
    setStyle(nextStyle);
    setLoopable(nextMode !== 'sfx');
    setDuration(nextMode === 'sfx' ? 4 : 16);
    setIntensity(nextMode === 'sfx' ? 6 : 7);
    setError('');
  }

  function changeMode(nextMode) {
    applyPreset(promptPresets[nextMode][0], nextMode, nextMode === 'sfx' ? 'Hip Hop' : nextMode === 'loop' ? 'Hip Hop' : 'R&B');
    setJob(null);
  }

  async function handleGenerate(event) {
    event.preventDefault();
    setIsGenerating(true);
    setError('');
    navigate('/create', {
      state: {
        autoGenerate: true,
        requestId: `${Date.now()}-${Math.random()}`,
        settings: { mode, prompt, style, duration, intensity, loopable },
      },
    });
  }

  return (
    <form onSubmit={handleGenerate} className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-8 sm:px-6 lg:px-10 lg:pt-16">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
          Turn your thoughts into music
        </h1>

        <div className="mt-7 rounded-lg border border-white/10 bg-[#151317]/92 p-3 shadow-[0_16px_80px_rgba(30,64,175,0.22)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/10 sm:inline-flex"
              aria-label="Add prompt detail"
            >
              <Plus size={18} />
            </button>

            <textarea
              className="min-h-16 flex-1 resize-none bg-transparent px-2 py-2 text-left text-base font-semibold leading-6 text-white outline-none placeholder:text-white/32"
              value={prompt}
              placeholder={selectedMode.placeholder}
              onChange={(event) => setPrompt(event.target.value)}
            />

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center rounded-full border border-white/10 bg-white/[0.04] p-1 sm:flex">
                {modes.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === mode;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black transition ${
                        active ? 'bg-white text-ink' : 'text-white/48 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => changeMode(item.id)}
                    >
                      <Icon size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={isGenerating || !generationReady}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563eb,#db2777,#f97316)] px-5 text-sm font-black text-white shadow-[0_12px_36px_rgba(219,39,119,0.24)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={17} /> : <Wand2 size={17} />}
                Create
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-wrap gap-2">
              {stylePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                    style === preset
                      ? 'bg-sky text-ink'
                      : 'border border-white/10 bg-white/[0.035] text-white/48 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setStyle(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/45">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                <Timer size={14} />
                {duration}s
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                <Gauge size={14} />
                {intensity}
              </span>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-sky"
                  checked={loopable}
                  disabled={mode === 'sfx'}
                  onChange={(event) => setLoopable(event.target.checked)}
                />
                Loop
              </label>
            </div>
          </div>

          <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/35">
              <Timer size={15} />
              <input
                className="w-full accent-sky"
                type="range"
                min="2"
                max="30"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              />
            </label>
            <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/35">
              <SlidersHorizontal size={15} />
              <input
                className="w-full accent-sky"
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(event) => setIntensity(Number(event.target.value))}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-coral/35 bg-coral/10 p-3 text-sm font-semibold text-coral">
            {error}
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-2">
          {featureCards.map((card) => (
            <button
              key={card.title}
              type="button"
              className="group relative min-h-52 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] text-left"
              onClick={() => applyPreset(card.prompt, card.mode, card.style)}
            >
              <img className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-105" src={card.image} alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
              <div className="relative flex min-h-52 flex-col justify-end p-5">
                <span className="mb-auto w-fit rounded-full bg-pink-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white">
                  {card.label}
                </span>
                <h2 className="max-w-md font-display text-xl font-black text-white">{card.title}</h2>
                <p className="mt-2 max-w-md text-sm font-semibold leading-5 text-white/72">{card.copy}</p>
                <span className="mt-4 inline-flex h-9 w-fit items-center rounded-full bg-white px-4 text-xs font-black text-ink">
                  Try it
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {collections.map((collection) => (
            <section key={collection.title} className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
                  onClick={() => applyPreset(collection.items[0][3], collection.items[0][4], collection.items[0][2])}
                  aria-label={`Use ${collection.title} prompt`}
                >
                  <img className="h-full w-full object-cover" src={collection.cover} alt="" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                    <Play size={26} fill="currentColor" />
                  </span>
                </button>
                <h2 className="font-display text-lg font-black text-white">{collection.title}</h2>
              </div>

              <div className="mt-5 grid gap-3">
                {collection.items.map(([title, tag, itemStyle, itemPrompt, itemMode]) => (
                  <button
                    key={title}
                    type="button"
                    className="flex items-center gap-3 rounded-lg p-2 text-left transition hover:bg-white/[0.06]"
                    onClick={() => applyPreset(itemPrompt, itemMode, itemStyle)}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#1d4ed8,#0f172a,#db2777)] text-white">
                      <Play size={16} fill="currentColor" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-white">{title}</span>
                      <span className="mt-1 block truncate text-xs font-semibold text-white/42">{tag}</span>
                    </span>
                    <span className="rounded-full border border-pink-400/35 bg-pink-500/10 px-2 py-0.5 text-[10px] font-black text-pink-300">
                      {itemStyle}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#151515]/95 backdrop-blur-xl lg:left-60">
        <div className="mx-auto flex max-w-[1260px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#2563eb,#db2777)] text-white">
              {isWaiting ? <Loader2 className="animate-spin" size={20} /> : job?.status === 'completed' ? <Check size={20} /> : <Music size={20} />}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-white">
                {job?.status === 'completed' ? 'Generation ready' : isWaiting ? 'Rendering your track' : 'Ready to create'}
              </div>
              <div className="mt-1 truncate text-xs font-semibold text-white/42">
                {taskLabel || `${route} - ${statusLabel} - ${formatDuration(job?.result?.duration || duration)}`}
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3">
            <div className="hidden h-10 flex-1 items-end gap-0.5 sm:flex">
              {peaks.map((peak, index) => (
                <span
                  key={`${peak}-${index}`}
                  className={`flex-1 rounded-t-sm bg-white/50 ${isWaiting ? 'animate-pulse' : ''}`}
                  style={{ height: `${Math.round(16 + peak * 76)}%` }}
                />
              ))}
            </div>
            {audioSource ? (
              <audio className="w-full max-w-md" controls src={audioSource} />
            ) : (
              <div className="hidden h-9 w-full max-w-md items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white/32 md:flex">
                Audio will appear here
              </div>
            )}
          </div>

          <a
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition ${
              audioSource ? 'bg-white text-ink hover:bg-sky' : 'pointer-events-none bg-white/10 text-white/24'
            }`}
            href={audioSource || undefined}
            download={`soundly-${mode}-${job?.id || 'preview'}.${audioExtension}`}
          >
            <Download size={16} />
            Download
          </a>
        </div>
      </div>

      <div className="fixed right-3 top-20 z-30 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-white/45 lg:right-5">
        {generationReady ? <span className="text-sky">Ready</span> : <span className="inline-flex items-center gap-1 text-amber"><AlertTriangle size={13} /> Offline</span>}
      </div>
    </form>
  );
}
