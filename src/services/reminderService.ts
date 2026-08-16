import type { CropReminder } from '../types/cropIntelligence'

const key = 'cg-crop-reminders'
function read(): CropReminder[] { try { return JSON.parse(localStorage.getItem(key) || '[]') as CropReminder[] } catch { return [] } }
export const reminders = {
  list: () => read(),
  save: (reminder: CropReminder) => { localStorage.setItem(key, JSON.stringify([...read().filter((item) => item.id !== reminder.id), reminder])) },
  complete: (id: string) => { localStorage.setItem(key, JSON.stringify(read().map((item) => item.id === id ? { ...item, completed: true } : item))) },
}
