import { BellRing, Check, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { alerts } from '../data/mockData'
import { reminders } from '../services/reminderService'
import { Card, PageHeader, Pill } from '../components/ui/UI'

export function AlertsPage() {
  const [localReminders, setLocalReminders] = useState(reminders.list())
  const complete = (id: string) => { reminders.complete(id); setLocalReminders(reminders.list()) }
  return <><PageHeader eyebrow="Stay one step ahead" title="Alerts" action={<button className="text-sm font-bold text-forest"><CheckCheck size={18} className="inline"/> Mark read</button>}/>{localReminders.length > 0 && <><h2 className="mb-3 mt-6 font-extrabold">Crop reminders</h2><div className="mb-6 space-y-3">{localReminders.map((reminder) => <Card key={reminder.id} className="flex gap-4 p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint text-forest"><BellRing size={20}/></span><div className="flex-1"><div className="flex items-start justify-between gap-2"><h2 className="font-extrabold">{reminder.title}</h2><Pill tone={reminder.completed ? 'green' : 'amber'}>{reminder.completed ? 'Completed' : reminder.kind}</Pill></div><p className="mt-1 text-sm leading-6 text-ink/60">Due {new Date(reminder.dueAt).toLocaleDateString('en-IN')}</p>{!reminder.completed && <button onClick={() => complete(reminder.id)} className="mt-2 flex items-center gap-1 text-xs font-extrabold text-forest"><Check size={14}/>Mark complete</button>}</div></Card>)}</div></>}{<div className="space-y-3">{alerts.map(a=><Card key={a.id} className="flex gap-4 p-5"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${a.severity==='High'?'bg-red-50 text-red-500':'bg-mint text-forest'}`}><BellRing size={20}/></span><div className="flex-1"><div className="flex items-start justify-between gap-2"><h2 className="font-extrabold">{a.title}</h2><Pill tone={a.severity==='High'?'red':a.severity==='Moderate'?'amber':'green'}>{a.severity}</Pill></div><p className="mt-1 text-sm leading-6 text-ink/60">{a.body}</p><p className="mt-2 text-xs font-bold text-ink/40">{a.time}</p></div></Card>)}</div>}</>
}
