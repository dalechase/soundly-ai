export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.24em] text-neon">{eyebrow}</p>}
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-7 text-white/62">{description}</p>}
      </div>
      {action}
    </div>
  );
}
