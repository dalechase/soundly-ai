import { Beaker, Home, Library, Plus, Search, Settings, Sparkles, Wand2 } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  ['Home', Home, '/'],
  ['Create', Wand2, '/create'],
  ['Library', Library, '/'],
  ['Search', Search, '/'],
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-ink text-frost">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/10 bg-[#07090f] px-5 py-6 lg:flex lg:flex-col">
        <div className="flex items-center justify-between">
          <div className="font-display text-3xl font-black tracking-tight text-white">Sound.ly</div>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/42 hover:bg-white/10 hover:text-white" type="button">
            <Plus size={18} />
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[linear-gradient(135deg,#60a5fa,#ec4899,#f97316)]" />
            <div>
              <div className="text-sm font-bold text-white">soundlyuser</div>
              <div className="text-xs font-semibold text-white/42">Free credits</div>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 h-10 w-full rounded-full border border-white/10 bg-white text-sm font-black text-ink transition hover:bg-sky"
          >
            Upgrade
          </button>
        </div>

        <nav className="mt-8 grid gap-1">
          {navItems.map(([label, Icon, href]) => (
            <NavLink
              key={label}
              to={href}
              end={href === '/'}
              className={({ isActive }) => `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                isActive && (href !== '/' || label === 'Home') ? 'bg-white/10 text-white' : 'text-white/44 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 grid gap-1 border-t border-white/10 pt-5">
          <button type="button" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/44 hover:bg-white/[0.06] hover:text-white">
            <Sparkles size={17} />
            Hooks
          </button>
          <button type="button" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/44 hover:bg-white/[0.06] hover:text-white">
            <Beaker size={17} />
            Labs
          </button>
        </div>

        <div className="mt-auto grid gap-1">
          <button type="button" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/36 hover:bg-white/[0.06] hover:text-white">
            <Settings size={17} />
            Settings
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <div className="flex h-14 items-center justify-between border-b border-white/10 bg-[#07090f]/95 px-4 lg:hidden">
          <div className="font-display text-xl font-black text-white">Sound.ly</div>
          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-sky">Mureka</div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
