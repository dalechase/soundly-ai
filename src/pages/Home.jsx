import { ArrowRight, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  defaultSettings,
  generationKinds,
  moodPresets,
  stylePresets,
  useAudioStore,
} from '../lib/audioStore';

const promptExamples = {
  song: 'A glossy blue-hour pop song with emotional vocal hook, pulsing synth bass, crisp drums, and a huge final chorus',
  instrumental: 'A cinematic instrumental cue for a product launch, confident piano motif, deep pulse, clean modern percussion',
  remix: 'A dance remix of a dreamy indie chorus, faster drums, bright synth stabs, club-ready drop, polished wide mix',
};

export default function Home() {
  const navigate = useNavigate();
  const { audioStatus } = useAudioStore();
  const [settings, setSettings] = useState(defaultSettings);

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function chooseKind(kind) {
    setSettings((current) => ({
      ...current,
      kind,
      prompt: promptExamples[kind],
    }));
  }

  function submit(event) {
    event.preventDefault();
    navigate('/create', {
      state: {
        autoGenerate: true,
        requestId: `${Date.now()}-${Math.random()}`,
        settings,
      },
    });
  }

  return (
    <main className="min-h-screen pb-40">
      <section className="relative overflow-hidden border-b border-white/10">
        <img className="absolute inset-0 h-full w-full object-cover opacity-30" src="/assets/soundly-hero.png" alt="" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#06101f_0%,rgba(6,16,31,0.9)_38%,rgba(6,16,31,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,204,102,0.18),transparent_24%)]" />
        <div className="relative mx-auto max-w-[980px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <form onSubmit={submit}>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-tight text-white sm:text-6xl">
              Create songs, instrumentals, and remixes from one prompt.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-blue-50/70">
              Start with a plain-language idea, choose the shape of the track, and generate directly into your saved library.
            </p>

            <div className="mt-7 rounded-md border border-white/10 bg-[rgba(9,24,44,0.88)] p-4 shadow-[0_28px_120px_rgba(56,189,248,0.12)]">
              <div className="grid gap-2 sm:grid-cols-3">
                {generationKinds.map((kind) => (
                  <button
                    key={kind.id}
                    type="button"
                    onClick={() => chooseKind(kind.id)}
                    className={`rounded-md border p-3 text-left transition ${
                      settings.kind === kind.id
                        ? 'border-sky/60 bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white shadow-[0_0_34px_rgba(56,189,248,0.24)]'
                        : 'border-white/10 bg-white/5 text-blue-50/70 hover:border-amber/30 hover:text-white'
                    }`}
                  >
                    <span className="block text-sm font-black">{kind.label}</span>
                    <span className="mt-1 block text-xs font-semibold leading-5 opacity-75">{kind.description}</span>
                  </button>
                ))}
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-amber/80">Prompt</span>
                <textarea
                  className="mt-2 min-h-32 w-full resize-none rounded-md border border-white/10 bg-white/5 p-4 text-base font-semibold leading-7 text-white outline-none transition placeholder:text-blue-50/30 focus:border-sky/55"
                  value={settings.prompt}
                  onChange={(event) => updateSetting('prompt', event.target.value)}
                  placeholder="Describe the track you want to hear"
                />
              </label>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-amber/80">Style</div>
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

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 text-sm font-black text-white shadow-[0_0_34px_rgba(56,189,248,0.24)] transition hover:brightness-105"
                >
                  <Wand2 size={18} />
                  Create
                  <ArrowRight size={17} />
                </button>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-50/60">
                  <span className={`h-2 w-2 rounded-full ${audioStatus?.ready ? 'bg-amber' : 'bg-sky'}`} />
                  {audioStatus?.murekaConfigured ? 'Mureka credentials loaded' : 'Fallback composer ready'}
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
