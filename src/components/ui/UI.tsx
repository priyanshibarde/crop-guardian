import type { ReactNode } from 'react'
import { ChevronRight, X } from 'lucide-react'

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(21,62,45,.06)] border border-emerald-950/5 transition-all duration-200 ${className}`}>
    {children}
  </section>
)

export const Pill = ({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'red' | 'amber' | 'neutral' }) => {
  const c = {
    green: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
    red: 'bg-red-50 text-red-700 border border-red-200/60',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-tight ${c}`}>{children}</span>
}

export const PageHeader = ({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) => (
  <header className="mb-6 flex items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-forest/70">{eyebrow}</p>}
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">{title}</h1>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
)

export const LinkArrow = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1 text-sm font-extrabold text-forest transition hover:translate-x-0.5">
    {children}
    <ChevronRight size={16} />
  </span>
)

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl transition-all" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <h3 className="text-lg font-black text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink/40 hover:bg-slate-100 hover:text-ink transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
