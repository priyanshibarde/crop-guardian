import { Bell, Calculator, ClipboardList, HeartPulse, Home, Map, ScanLine, Sprout, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../../i18n'
import { useAuth } from '../../context/AuthContext'
import { storage } from '../../services/storageService'

export function AppLayout() {
  const { t } = useLanguage()
  const { profile: authProfile } = useAuth()
  const profile = authProfile ?? storage.profile()
  const nav = [['/', Home, t.home], ['/scan', ScanLine, t.scan], ['/diagnoses', ClipboardList, t.diagnosisHistory], ['/hotspots', Map, t.hotspots], ['/crops', Sprout, t.crops], ['/alerts', Bell, t.alerts]] as const
  return <div className="min-h-screen">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-emerald-950/5 bg-white p-6 lg:block">
      <NavLink to="/" className="flex items-center gap-3 text-xl font-black text-forest"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-white"><HeartPulse size={22}/></span>CROP<br/>GUARDIAN</NavLink>
      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-ink/35">{t.navigation}</p>
      <nav className="mt-3 space-y-1">
        {nav.map(([to, Icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${isActive ? 'bg-mint text-forest' : 'text-ink/60 hover:bg-slate-50'}`}><Icon size={19}/>{label}</NavLink>)}
        <NavLink to="/calculator" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-ink/60"><Calculator size={19}/>{t.calculator}</NavLink>
      </nav>
      <NavLink to="/profile" className="absolute bottom-7 flex items-center gap-3 text-sm font-bold text-ink/70">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-sun font-black">{profile?.name?.charAt(0).toUpperCase() || 'U'}</span>
        {profile?.name || 'User'}
        <UserRound size={16}/>
      </NavLink>
    </aside>
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:py-9"><Outlet/></main>
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-emerald-950/10 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {nav.map(([to, Icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold ${isActive ? 'text-forest' : 'text-ink/45'}`}><Icon size={20}/>{label}</NavLink>)}
    </nav>
  </div>
}

