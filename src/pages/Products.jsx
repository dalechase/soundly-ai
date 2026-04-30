import { AudioWaveform, CheckCircle2, Cpu, HardDrive, Link2, Music, ServerCog, ShieldCheck, Zap } from 'lucide-react';
import Container from '../components/Container';
import SectionHeader from '../components/SectionHeader';

const stack = [
  {
    name: 'Music generation',
    model: 'Mureka',
    icon: Music,
    role: 'Routes realistic song, vocal, accompaniment, and long-form structure jobs to the hosted music API.',
  },
  {
    name: 'Self-hosted bridge',
    model: 'YuE optional',
    icon: Link2,
    role: 'Keeps the command-worker path available for custom music or SFX models when a local GPU route is needed.',
  },
  {
    name: 'Sound effects',
    model: 'Stable Audio Open',
    icon: Zap,
    role: 'Routes short SFX, foley, ambience, impacts, risers, and production elements.',
  },
  {
    name: 'Job API',
    model: '/api/audio/generate',
    icon: ServerCog,
    role: 'Normalizes prompts, stores job metadata, creates Mureka tasks, and polls until audio is ready.',
  },
  {
    name: 'Built-in composer',
    model: 'Sound.ly Composer',
    icon: AudioWaveform,
    role: 'Queues jobs and renders fresh prompt-conditioned WAV files when no external model worker is attached.',
  },
];

const requirements = [
  'Set MUREKA_API_KEY server-side',
  'Poll generation tasks until completed',
  'Include model name, duration, MIME type, and optional waveform peaks',
  'Keep model version metadata with every completed job',
];

export default function Products() {
  return (
    <div className="bg-mesh-dark">
      <Container className="py-14 sm:py-20">
        <SectionHeader
          eyebrow="Model Stack"
          title="Hosted music with local fallbacks"
          description="The frontend queues generation jobs, polls until audio is ready, and plays back results from Mureka, an optional worker, or the built-in composer."
        />
      </Container>

      <Container className="pb-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {stack.map(({ name, model, icon: Icon, role }) => (
            <article key={name} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <Icon className="text-neon" size={26} />
              <h2 className="mt-5 font-display text-xl font-bold text-white">{name}</h2>
              <div className="mt-3 text-sm font-bold text-violet">{model}</div>
              <p className="mt-3 text-sm leading-6 text-white/62">{role}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-panel/72 p-6">
            <Cpu className="text-neon" size={30} />
            <h2 className="mt-5 font-display text-3xl font-bold text-white">Provider contract</h2>
            <p className="mt-4 text-base leading-7 text-white/62">
              Add MUREKA_API_KEY for the primary realistic music route. Point SOUNDLY_AUDIO_WORKER_URL at a GPU service when you want a custom SFX or self-hosted model route.
            </p>
            <div className="mt-6 grid gap-3">
              {requirements.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/72">
                  <CheckCircle2 className="text-neon" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-neon">
                <ShieldCheck size={24} />
              </span>
              <div>
                <h2 className="font-display text-3xl font-bold text-white">Production notes</h2>
                <p className="mt-1 text-sm font-semibold text-white/48">The user-facing promise stays simple; the backend keeps the paper trail.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {['Rate limits for free generation', 'Queue status for long jobs', 'Prompt moderation and artist-name policy', 'Object storage for generated audio', 'Per-model license metadata', 'Seeds for repeatable variations', 'Mureka as the primary music route', 'Stable Audio worker for SFX'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-ink/45 p-4 text-sm font-semibold text-white/66">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-ink/55 p-5">
          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-white/38">
            <HardDrive size={17} />
            Expected provider response
          </div>
          <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-coal p-4 text-xs leading-6 text-white/70">
{`{
  "provider": "mureka",
  "model": "mureka-auto",
  "audioUrl": "https://cdn.sound.ly/jobs/job-id.wav",
  "mimeType": "audio/wav",
  "duration": 12,
  "previewPeaks": [0.12, 0.44, 0.31]
}`}
          </pre>
        </div>
      </Container>
    </div>
  );
}
