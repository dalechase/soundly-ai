import { Disc3, Home, Library, Wand2 } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import BottomPlayer from './BottomPlayer';

const navItems = [
  ['Home', Home, '/'],
  ['Create', Wand2, '/create'],
  ['Library', Library, '/library'],
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#06101f] text-blue-50">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(7,18,34,0.9)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-2 font-display text-xl font-black text-white">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white shadow-[0_0_34px_rgba(56,189,248,0.24)]">
              <Disc3 size={20} />
            </span>
            Sound.ly
          </NavLink>

          <nav className="flex items-center gap-1">
            {navItems.map(([label, Icon, href]) => (
              <NavLink
                key={label}
                to={href}
                end={href === '/'}
                className={({ isActive }) => `inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                  isActive
                    ? 'bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white shadow-[0_0_34px_rgba(56,189,248,0.22)]'
                    : 'text-blue-100/60 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon size={17} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Outlet />
      <BottomPlayer />
    </div>
  );
}
