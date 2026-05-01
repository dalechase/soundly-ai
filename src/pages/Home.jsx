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
      <section className="relative overflow-hidden border-b border-blue-200/10">
        <img className="absolute inset-0 h-full w-full object-cover opacity-30" src="/assets/soundly-hero.png" alt="" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#06101f_0%,rgba(6,16,31,0.92)_44%,rgba(6,16,31,0.62)_100%)]" />
        <div className="relative mx-auto max-w-[980px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <form onSubmit={submit}>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-tight text-white sm:text-6xl">
              Create songs, instrumentals, and remixes from one prompt.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-blue-100/68">
              Start with a plain-language idea, choose the shape of the track, and generate directly into your saved library.
            </p>

            <div className="mt-7 rounded-md border border-blue-200/10 bg-[#071a33]/90 p-4 shadow-[0_24px_100px_rgba(37,99,235,0.22)]">
              <div className="grid gap-2 sm:grid-cols-3">
                {generationKinds.map((kind) => (
                  <button
                    key={kind.id}
                    type="button"
                    onClick={() => chooseKind(kind.id)}
                    className={`rounded-md border p-3 text-left transition ${
                      settings.kind === kind.id
                        ? 'border-sky bg-blue-500 text-white shadow-glow'
                        : 'border-blue-200/10 bg-blue-950/45 text-blue-100/65 hover:border-blue-300/30 hover:text-white'
                    }`}
                  >
                    <span className="block text-sm font-black">{kind.label}</span>
                    <span className="mt-1 block text-xs font-semibold leading-5 opacity-75">{kind.description}</span>
                  </button>
                ))}
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-200/45">Prompt</span>
                <textarea
                  className="mt-2 min-h-32 w-full resize-none rounded-md border border-blue-200/10 bg-blue-950/55 p-4 text-base font-semibold leading-7 text-white outline-none transition placeholder:text-blue-100/28 focus:border-sky"
                  value={settings.prompt}
                  onChange={(event) => updateSetting('prompt', event.target.value)}
                  placeholder="Describe the track you want to hear"
                />
              </label>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-200/45">Style</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stylePresets.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateSetting('style', style)}
                        className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                          settings.style === style
                            ? 'border-sky bg-sky text-blue-950'
                            : 'border-blue-200/10 bg-blue-950/45 text-blue-100/58 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-200/45">Mood</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {moodPresets.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => updateSetting('mood', mood)}
                        className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                          settings.mood === mood
                            ? 'border-sky bg-sky text-blue-950'
                            : 'border-blue-200/10 bg-blue-950/45 text-blue-100/58 hover:text-white'
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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-500 px-5 text-sm font-black text-white shadow-glow transition hover:bg-blue-400"
                >
                  <Wand2 size={18} />
                  Create
                  <ArrowRight size={17} />
                </button>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-100/52">
                  <span className={`h-2 w-2 rounded-full ${audioStatus?.ready ? 'bg-sky' : 'bg-amber'}`} />
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
