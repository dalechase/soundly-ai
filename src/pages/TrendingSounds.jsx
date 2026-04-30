import { Library, Search } from 'lucide-react';
import Container from '../components/Container';
import SectionHeader from '../components/SectionHeader';
import TrendCard from '../components/TrendCard';
import { trends } from '../data/mockData';

export default function TrendingSounds() {
  return (
    <div className="bg-mesh-dark">
      <Container className="py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <SectionHeader
            eyebrow="Prompt Library"
            title="Audio ideas ready to generate"
            description="Start from a recognizable creator sound, then open the generator and turn the idea into music, loops, ambience, or SFX."
          />
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <Library className="text-neon" size={28} />
            <div className="mt-5 font-display text-2xl font-bold text-white">From trend to WAV</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Use these as prompt seeds, then vary mood, duration, intensity, and loop settings.
            </p>
          </div>
        </div>
      </Container>

      <Container className="pb-20">
        <div className="mb-8 rounded-3xl border border-white/10 bg-panel/72 p-5">
          <div className="flex items-center gap-3 text-sm font-bold text-white/72">
            <Search className="text-neon" size={18} />
            Try prompts like short cinematic impact for a product reveal or loopable lo-fi bed for a study stream.
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      </Container>
    </div>
  );
}
