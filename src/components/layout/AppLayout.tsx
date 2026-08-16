import { Bell, Calculator, ClipboardList, HeartPulse, Home, Map, ScanLine, Sprout, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../../i18n'
import { useAuth } from '../../context/AuthContext'
import { storage } from '../../services/storageService'

export function AppLayout() {
  const { t } = useLanguage()
  const { profile: authProfile } = useAuth()
  const profile = authProfile ?? storage.profile()
  const displayName = profile?.fullName || profile?.name || 'Farmer'

  const nav = [
    ['/', Home, t.home],
    ['/scan', ScanLine, t.scan],
    ['/diagnoses', ClipboardList, t.diagnosisHistory],
    ['/hotspots', Map, t.hotspots],
    ['/crops', Sprout, t.crops],
    ['/alerts', Bell, t.alerts],
  ] as const

  return (
    <div className="min-h-screen bg-[#f7f9f5]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-emerald-950/5 bg-white p-6 lg:block shadow-xs">
        <NavLink to="/" className="flex items-center gap-3 text-xl font-black text-forest">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-white shadow-xs">
            <HeartPulse size={22} />
          </span>
          <span>
            CROP
            <br />
            GUARDIAN
          </span>
        </NavLink>

        <p className="mt-8 text-xs font-black uppercase tracking-widest text-ink/35">{t.navigation}</p>
        <nav className="mt-3 space-y-1.5">
          {nav.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-mint text-forest shadow-xs font-black'
                    : 'text-ink/65 hover:bg-slate-50 hover:text-ink'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/calculator"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? 'bg-mint text-forest shadow-xs font-black'
                  : 'text-ink/65 hover:bg-slate-50 hover:text-ink'
              }`
            }
          >
            <Calculator size={19} />
            {t.calculator}
          </NavLink>
        </nav>

        <NavLink
          to="/profile"
          className="absolute bottom-7 left-6 right-6 flex items-center justify-between rounded-2xl bg-sand/60 p-3 text-sm font-bold text-ink/80 hover:bg-sand transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-sm font-black text-ink">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate font-black text-xs text-ink">{displayName}</span>
          </div>
          <UserRound size={16} className="text-ink/40 shrink-0" />
        </NavLink>
      </aside>

      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-emerald-950/10 bg-white/95 px-2 py-2.5 backdrop-blur-md lg:hidden shadow-lg">
        {nav.map(([to, Icon, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold transition-colors ${
                isActive ? 'text-forest font-black scale-105' : 'text-ink/45 hover:text-ink'
              }`
            }
          >
            <Icon size={20} />
            <span className="truncate max-w-14">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
