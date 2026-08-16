import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
export const Card=({children,className=''}:{children:ReactNode,className?:string})=><section className={`rounded-3xl bg-white p-4 shadow-[0_8px_28px_rgba(21,62,45,.06)] ${className}`}>{children}</section>
export const Pill=({children,tone='green'}:{children:ReactNode,tone?:'green'|'red'|'amber'})=>{const c={green:'bg-emerald-50 text-forest',red:'bg-red-50 text-red-600',amber:'bg-amber-50 text-amber-700'}[tone];return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${c}`}>{children}</span>}
export const PageHeader=({eyebrow,title,action}:{eyebrow?:string,title:string,action?:ReactNode})=><header className="mb-5 flex items-end justify-between"><div>{eyebrow&&<p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-forest/60">{eyebrow}</p>}<h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1></div>{action}</header>
export const LinkArrow=({children}:{children:ReactNode})=><span className="inline-flex items-center gap-1 text-sm font-bold text-forest">{children}<ChevronRight size={16}/></span>
