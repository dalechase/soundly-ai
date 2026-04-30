import { ArrowRight, Film, Gamepad2, Megaphone, Mic2, Radio, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import SectionHeader from '../components/SectionHeader';

const workflows = [
  {
    title: 'Short-form video',
    icon: Film,
    prompts: ['upbeat creator intro bed', 'clean whoosh transition', 'soft end-card shimmer'],
    export: '8-15s WAV clips',
  },
  {
    title: 'Games and apps',
    icon: Gamepad2,
    prompts: ['reward pickup', 'menu hover', 'low-health alert', 'ambient level loop'],
    export: '2-8s SFX and loops',
  },
  {
    title: 'Podcasts',
    icon: Mic2,
    prompts: ['intro sting', 'chapter bumper', 'calm interview bed'],
    export: 'Music beds and stingers',
  },
  {
    title: 'Streams',
    icon: Radio,
    prompts: ['starting soon loop', 'subscriber sparkle', 'scene transition hit'],
    export: 'Loopable beds and alerts',
  },
  {
    title: 'Ads and launches',
    icon: Megaphone,
    prompts: ['premium product reveal', 'cinematic impact', 'bright CTA button sound'],
    export: 'Polished campaign assets',
  },
  {
    title: 'Sound design',
    icon: Sparkles,
    prompts: ['rainy neon alley ambience', 'mechanical door servo', 'textile foley sweep'],
    export: 'Foley and ambience',
  },
];

export default function GearKits() {
  return (
    <div className="bg-mesh-dark">
      <Container className="py-14 sm:py-20">
        <SectionHeader
          eyebrow="Workflows"
          title="Generate the audio asset your project needs"
          description="Each workflow starts with practical prompt patterns and ends in downloadable audio, so creators do not have to hunt through stock libraries."
        />
      </Container>

      <Container className="pb-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map(({ title, icon: Icon, prompts, export: exportLabel }) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neon text-ink shadow-glow">
                  <Icon size={22} />
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/52">
                  {exportLabel}
                </span>
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-white">{title}</h2>
              <div className="mt-5 grid gap-2">
                {prompts.map((prompt) => (
                  <div key={prompt} className="rounded-xl border border-white/10 bg-ink/45 px-3 py-2 text-sm font-semibold text-white/66">
                    {prompt}
                  </div>
                ))}
              </div>
              <Link
                to="/"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-ink transition hover:bg-neon"
              >
                Generate for {title}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
