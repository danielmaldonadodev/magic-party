// lib/formatDate.js
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date) {
  try {
    return format(new Date(date), "d 'de' MMM yyyy · HH:mm", { locale: es })
  } catch {
    return '—'
  }
}
