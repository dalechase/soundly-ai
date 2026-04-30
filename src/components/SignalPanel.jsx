import { Activity, Radio, Zap } from 'lucide-react';

export default function SignalPanel() {
  const rows = [
    ['TikTok vocal chains', '97', '+28%'],
    ['Podcast clarity', '94', '+16%'],
    ['Lo-fi textures', '91', '+18%'],
    ['Afrobeats bounce', '86', '+21%'],
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-glow">
      <div className="absolute inset-0 bg-signal-grid bg-[length:34px_34px] opacity-20" />
      <div className="relative rounded-2xl border border-white/10 bg-ink/78 p-5 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neon">Live Signal</p>
            <h3 className="mt-2 font-display text-xl font-semibold">Audio Trend Scanner</h3>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10 text-neon">
            <Radio size={22} />
          </span>
        </div>

        <div className="mt-7 space-y-3">
          {rows.map(([label, score, velocity]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-white/84">{label}</span>
                <span className="text-sm font-bold text-neon">{score}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-gradient-to-r from-neon to-violet" style={{ width: `${score}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/50">
                <Activity size={13} />
                <span>{velocity} discovery velocity</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neon/20 bg-neon/10 p-4">
            <Zap className="text-neon" size={18} />
            <div className="mt-3 text-2xl font-bold">38</div>
            <div className="text-xs text-white/55">Gear matches</div>
          </div>
          <div className="rounded-2xl border border-violet/20 bg-violet/10 p-4">
            <Zap className="text-violet" size={18} />
            <div className="mt-3 text-2xl font-bold">12</div>
            <div className="text-xs text-white/55">Articles queued</div>
          </div>
        </div>
      </div>
    </div>
  );
}
