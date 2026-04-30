export default function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm font-semibold text-white/78">{label}</div>
      {detail && <div className="mt-2 text-sm leading-6 text-white/50">{detail}</div>}
    </div>
  );
}
