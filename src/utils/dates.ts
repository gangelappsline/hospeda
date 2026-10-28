/**
 * Utilidades de fechas para el calendario de reservas.
 * Todas las funciones trabajan con fechas "locales" (sin hora) para evitar
 * los saltos de un día que provoca el uso de UTC al comparar días.
 */

export const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const

export const MONTH_NAMES_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const

/** Semana que inicia en lunes (convención en México / LatAm). */
export const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const
export const WEEKDAY_LABELS_LONG = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
] as const

/** Devuelve una copia de la fecha a las 00:00 hora local. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function today(): Date {
  return startOfDay(new Date())
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime()
}

export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime()
}

/** true si `date` está entre `from` y `to`, ambos incluidos. */
export function isBetweenInclusive(date: Date, from: Date, to: Date): boolean {
  const time = startOfDay(date).getTime()
  return time >= startOfDay(from).getTime() && time <= startOfDay(to).getTime()
}

/** Número de noches entre la llegada y la salida. */
export function diffInNights(from: Date, to: Date): number {
  const ms =
    Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/** Convierte "YYYY-MM-DD" (o un ISO completo) a una fecha local. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** "12 oct" */
export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES_SHORT[date.getMonth()]}`
}

/** "12 de octubre" */
export function formatDayMonthLong(date: Date): string {
  return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`
}

/** "12 de octubre de 2026" */
export function formatFullDate(date: Date): string {
  return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`
}

/** "12 oct 2026" */
export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getFullYear()}`
}

/** "octubre 2026" */
export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Matriz de 6 semanas x 7 días para el mes indicado, iniciando en lunes.
 * Las celdas fuera del mes se rellenan con `null`.
 */
export function buildMonthMatrix(month: Date): Array<Array<Date | null>> {
  const firstOfMonth = startOfMonth(month)
  // getDay(): 0 = domingo … 6 = sábado. La rejilla inicia en lunes.
  const leadingEmptyDays = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(
    firstOfMonth.getFullYear(),
    firstOfMonth.getMonth() + 1,
    0
  ).getDate()

  const cells: Array<Date | null> = Array.from(
    { length: leadingEmptyDays },
    () => null
  )

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(
      new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), day)
    )
  }

  while (cells.length % 7 !== 0) cells.push(null)

  const rows: Array<Array<Date | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return rows
}

export function formatNights(nights: number): string {
  return `${nights} noche${nights === 1 ? '' : 's'}`
}

/** Formatea un precio en pesos mexicanos sin decimales. */
export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('es-MX')}`
}
