import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Info, Sparkles } from 'lucide-react'
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  addMonths,
  buildMonthMatrix,
  diffInNights,
  formatDayMonth,
  formatFullDate,
  formatMonthYear,
  formatNights,
  isAfter,
  isBefore,
  isBetweenInclusive,
  isSameDay,
  startOfMonth,
  toISODate,
  today,
} from '@/utils/dates'

export interface DateRange {
  checkIn: Date | null
  checkOut: Date | null
}

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
  /** Meses visibles simultáneamente (se adapta en pantallas pequeñas). */
  numberOfMonths?: 1 | 2
  minNights?: number
  maxNights?: number
  maxDate?: Date
  /** Fechas ya reservadas: se muestran deshabilitadas. */
  blockedDates?: Date[]
  showFooter?: boolean
  /** Oculta el resumen superior (útil en popovers estrechos). */
  showHeader?: boolean
  compact?: boolean
  className?: string
}

const MAX_MONTHS_AHEAD = 17

export default function DateRangeCalendar({
  value,
  onChange,
  numberOfMonths = 2,
  minNights = 1,
  maxNights = 90,
  maxDate,
  blockedDates = [],
  showFooter = true,
  showHeader = true,
  compact = false,
  className = '',
}: Props) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(value.checkIn ?? today())
  )
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const currentMonth = startOfMonth(today())
  const lastSelectableDate = useMemo(() => {
    const horizon = addMonths(currentMonth, MAX_MONTHS_AHEAD)
    if (maxDate && isBefore(maxDate, horizon)) return maxDate
    return new Date(horizon.getFullYear(), horizon.getMonth() + 1, 0)
  }, [currentMonth, maxDate])

  const blockedSet = useMemo(
    () => new Set(blockedDates.map((date) => toISODate(date))),
    [blockedDates]
  )

  const canGoPrevious = isAfter(visibleMonth, currentMonth)
  const lastVisibleMonth = addMonths(visibleMonth, numberOfMonths - 1)
  const canGoNext =
    startOfMonth(lastSelectableDate).getTime() >
    startOfMonth(lastVisibleMonth).getTime()

  const months = useMemo(
    () =>
      Array.from({ length: numberOfMonths }, (_, index) =>
        addMonths(visibleMonth, index)
      ),
    [visibleMonth, numberOfMonths]
  )

  // Se alinean ambos meses a la misma altura para que la rejilla no baile.
  const monthRows = useMemo(() => {
    const matrices = months.map((month) => buildMonthMatrix(month))
    const maxRows = Math.max(...matrices.map((matrix) => matrix.length))
    return matrices.map((matrix) =>
      matrix.length === maxRows
        ? matrix
        : [
            ...matrix,
            ...Array.from({ length: maxRows - matrix.length }, () =>
              Array.from({ length: 7 }, () => null as Date | null)
            ),
          ]
    )
  }, [months])

  const { checkIn, checkOut } = value

  const previewEnd =
    checkIn && !checkOut && hoveredDay && isAfter(hoveredDay, checkIn)
      ? hoveredDay
      : null

  const rangeStart = checkIn
  const rangeEnd = checkOut ?? previewEnd
  const hasFullRange = Boolean(checkIn && checkOut)
  const nights = checkIn && checkOut ? diffInNights(checkIn, checkOut) : 0

  const isDayBlocked = (day: Date) => {
    if (isBefore(day, today())) return true
    if (isAfter(day, lastSelectableDate)) return true
    if (blockedSet.has(toISODate(day))) return true

    if (checkIn && !checkOut && !isSameDay(day, checkIn)) {
      const candidateNights = diffInNights(checkIn, day)
      if (candidateNights < minNights || candidateNights > maxNights) {
        return true
      }
    }
    return false
  }

  const handleSelect = (day: Date) => {
    setNotice(null)

    // Sin llegada o con rango completo → inicia una nueva selección.
    if (!checkIn || (checkIn && checkOut)) {
      onChange({ checkIn: day, checkOut: null })
      return
    }

    if (isSameDay(day, checkIn)) return

    if (isBefore(day, checkIn)) {
      onChange({ checkIn: day, checkOut: null })
      return
    }

    const candidateNights = diffInNights(checkIn, day)
    if (candidateNights < minNights) {
      setNotice(
        `La estancia mínima es de ${formatNights(minNights)}. Ajusta tu salida.`
      )
      return
    }
    if (candidateNights > maxNights) {
      setNotice(`La estancia máxima es de ${formatNights(maxNights)}.`)
      return
    }

    onChange({ checkIn, checkOut: day })
  }

  const handleClear = () => {
    setNotice(null)
    setHoveredDay(null)
    onChange({ checkIn: null, checkOut: null })
  }

  return (
    <div className={className}>
      {/* Encabezado: resumen + navegación */}
      <div
        className={`flex items-center gap-3 px-1 pb-4 ${
          showHeader ? 'justify-between' : 'justify-end'
        }`}
      >
        {showHeader && (
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-vivid-tangerine-600">
            {hasFullRange
              ? `${formatNights(nights)} seleccionada${nights === 1 ? '' : 's'}`
              : checkIn
                ? 'Selecciona tu fecha de salida'
                : 'Selecciona tu fecha de llegada'}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-cool-steel-700">
            {checkIn ? (
              <>
                <span className="font-semibold text-cool-steel-900">
                  {formatDayMonth(checkIn)}
                </span>
                <span className="text-cool-steel-400">→</span>
                <span
                  className={
                    checkOut
                      ? 'font-semibold text-cool-steel-900'
                      : 'text-cool-steel-400'
                  }
                >
                  {checkOut ? formatDayMonth(checkOut) : 'Salida'}
                </span>
              </>
            ) : (
              <span className="text-cool-steel-500">
                Elige llegada y salida para ver el precio total
              </span>
            )}
          </p>
        </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            disabled={!canGoPrevious}
            aria-label="Mes anterior"
            className="w-9 h-9 rounded-full border border-cool-steel-200 bg-white text-cool-steel-700 flex items-center justify-center transition-all hover:border-cool-steel-300 hover:bg-cool-steel-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-cool-steel-200 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            disabled={!canGoNext}
            aria-label="Mes siguiente"
            className="w-9 h-9 rounded-full border border-cool-steel-200 bg-white text-cool-steel-700 flex items-center justify-center transition-all hover:border-cool-steel-300 hover:bg-cool-steel-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-cool-steel-200 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Rejilla de meses */}
      <div
        className={`grid gap-x-8 gap-y-6 ${
          numberOfMonths === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'
        }`}
        onMouseLeave={() => setHoveredDay(null)}
      >
        {months.map((month, monthIndex) => {
          const rows = monthRows[monthIndex]
          // En pantallas pequeñas solo se muestra el primer mes.
          const hideOnMobile = numberOfMonths === 2 && monthIndex > 0

          return (
            <div
              key={month.toISOString()}
              className={hideOnMobile ? 'hidden sm:block' : undefined}
            >
              <p className="mb-3 text-center text-sm font-semibold capitalize tracking-wide text-cool-steel-900">
                {formatMonthYear(month)}
              </p>

              <div className="grid grid-cols-7 mb-1">
                {WEEKDAY_LABELS.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className="text-center text-[10px] font-semibold uppercase tracking-wider text-cool-steel-400"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {rows.flatMap((row, rowIndex) =>
                  row.map((day, dayIndex) => {
                    const key = `${rowIndex}-${dayIndex}`

                    if (!day) {
                      return <div key={key} />
                    }

                    const disabled = isDayBlocked(day)
                    const isStart = isSameDay(day, rangeStart)
                    const isEnd = isSameDay(day, rangeEnd)
                    const inRange = Boolean(
                      rangeStart &&
                        rangeEnd &&
                        isBetweenInclusive(day, rangeStart, rangeEnd)
                    )
                    const isToday = isSameDay(day, today())
                    const isPreview = Boolean(
                      previewEnd && inRange && !isStart && !isEnd
                    )

                    return (
                      <div
                        key={key}
                        className={`relative flex items-center justify-center py-0.5 ${
                          inRange
                            ? isPreview
                              ? 'bg-vivid-tangerine-50/70'
                              : 'bg-vivid-tangerine-50'
                            : ''
                        } ${isStart && rangeEnd ? 'rounded-l-full' : ''} ${
                          isEnd && rangeStart ? 'rounded-r-full' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(day)}
                          disabled={disabled}
                          onMouseEnter={() => setHoveredDay(day)}
                          onFocus={() => setHoveredDay(day)}
                          aria-label={formatFullDate(day)}
                          aria-pressed={isStart || isEnd}
                          className={`relative z-10 mx-auto flex aspect-square w-full items-center justify-center rounded-full text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-vivid-tangerine-400 focus-visible:ring-offset-2 ${
                            compact ? 'max-w-9' : 'max-w-9 sm:max-w-10'
                          } ${
                            isStart || isEnd
                              ? 'bg-vivid-tangerine-500 text-white font-semibold shadow-md shadow-vivid-tangerine-500/30'
                              : disabled
                                ? 'text-cool-steel-300 line-through decoration-cool-steel-300 cursor-not-allowed'
                                : 'text-cool-steel-800 font-medium hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-cool-steel-200 cursor-pointer'
                          } ${
                            isToday && !(isStart || isEnd)
                              ? 'ring-1 ring-inset ring-vivid-tangerine-300 text-vivid-tangerine-700 font-semibold'
                              : ''
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Aviso de reglas */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-cool-steel-50/80 border border-cool-steel-100 px-3 py-2.5">
        <Info size={14} className="mt-0.5 shrink-0 text-cool-steel-500" />
        <p className="text-[11px] leading-relaxed text-cool-steel-600">
          {minNights > 1
            ? `Estancia mínima: ${formatNights(minNights)}. `
            : 'Puedes reservar desde 1 noche. '}
          Las fechas tachadas no están disponibles.
        </p>
      </div>

      {notice && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-vivid-tangerine-200 bg-vivid-tangerine-50 px-3 py-2 text-xs font-medium text-vivid-tangerine-700">
          <Sparkles size={13} className="shrink-0" />
          {notice}
        </p>
      )}

      {/* Pie de calendario */}
      {showFooter && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cool-steel-100 pt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cool-steel-50 border border-cool-steel-100 px-2.5 py-1 text-cool-steel-700">
              <span className="font-semibold text-cool-steel-900">Llegada</span>
              {checkIn ? formatDayMonth(checkIn) : '—'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cool-steel-50 border border-cool-steel-100 px-2.5 py-1 text-cool-steel-700">
              <span className="font-semibold text-cool-steel-900">Salida</span>
              {checkOut ? formatDayMonth(checkOut) : '—'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={!checkIn && !checkOut}
            className="text-xs font-semibold text-cool-steel-600 underline underline-offset-2 hover:text-cool-steel-900 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
          >
            Borrar fechas
          </button>
        </div>
      )}

      {/* Etiqueta del mes en curso para lectores de pantalla */}
      <span className="sr-only">
        {MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
      </span>
    </div>
  )
}
