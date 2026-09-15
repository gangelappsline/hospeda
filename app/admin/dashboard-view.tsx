"use client";

import {
  Building2,
  CalendarCheck,
  DollarSign,
  Loader2,
  MoreHorizontal,
  Star,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { useDashboard, type DashboardResponse } from "@/lib/hooks/use-dashboard";
import type { BookingStatus } from "@/lib/types";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const statusStyles: Record<BookingStatus, string> = {
  confirmada: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pendiente: "bg-amber-50 text-amber-700 ring-amber-200",
  cancelada: "bg-red-50 text-red-600 ring-red-200",
  completada: "bg-zinc-100 text-ink-700 ring-zinc-200",
};

export function DashboardView({
  initialData,
  userName,
}: {
  initialData: DashboardResponse;
  userName: string;
}) {
  const { data, isFetching } = useDashboard(initialData);

  if (!data) {
    return (
      <div className="grid place-items-center py-20 text-ink-500">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  const { stats, revenue, bookings, properties } = data;
  const maxRevenue = Math.max(...revenue.map((point) => point.value));

  return (
    <div className="space-y-8">
      {/* ---------- Encabezado ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Hola, {userName.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Este es el resumen de tu operación en Hospeda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isFetching ? (
            <span className="flex items-center gap-2 text-xs text-ink-500">
              <Loader2 className="size-3.5 animate-spin" />
              Actualizando…
            </span>
          ) : null}
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-zinc-50"
          >
            Últimos 30 días
          </button>
          <button
            type="button"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Nueva propiedad
          </button>
        </div>
      </div>

      {/* ---------- Métricas ---------- */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={DollarSign}
          hint="vs. mes anterior"
        />
        <StatCard
          label="Reservaciones activas"
          value={formatNumber(stats.activeBookings)}
          change={stats.bookingsChange}
          icon={CalendarCheck}
          hint="vs. mes anterior"
        />
        <StatCard
          label="Propiedades"
          value={formatNumber(stats.totalProperties)}
          change={stats.propertiesChange}
          icon={Building2}
          hint="publicadas y en revisión"
        />
        <StatCard
          label="Usuarios registrados"
          value={formatNumber(stats.totalUsers)}
          change={stats.usersChange}
          icon={Users}
          hint="vs. mes anterior"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ---------- Gráfica de ingresos ---------- */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-ink-900">
                Ingresos por mes
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Comportamiento de los últimos 9 meses
              </p>
            </div>
            <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-ink-700">
              2026
            </span>
          </div>

          <div className="mt-8 flex h-56 items-end gap-2 sm:gap-4">
            {revenue.map((point) => (
              <div
                key={point.month}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-[11px] font-medium text-ink-500 opacity-0 transition group-hover:opacity-100">
                  {formatCurrency(point.value)}
                </span>
                <div
                  className="w-full rounded-t-lg bg-brand-500/85 transition group-hover:bg-brand-500"
                  style={{ height: `${(point.value / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-ink-500">{point.month}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Top propiedades ---------- */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-base font-semibold text-ink-900">
            Propiedades destacadas
          </h2>
          <p className="mt-1 text-sm text-ink-500">Por calificación de huéspedes</p>

          <ul className="mt-6 space-y-4">
            {properties.slice(0, 4).map((property) => (
              <li key={property.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  loading="lazy"
                  className="size-12 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {property.title}
                  </p>
                  <p className="truncate text-xs text-ink-500">{property.city}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-900">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {property.rating.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------- Tabla de reservaciones ---------- */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-ink-900">
              Reservaciones recientes
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Últimos movimientos en tus propiedades
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-brand-500 hover:underline"
          >
            Ver todas
          </button>
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Huésped</th>
                <th className="px-6 py-3 font-semibold">Propiedad</th>
                <th className="px-6 py-3 font-semibold">Fechas</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="transition hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink-900">{booking.guestName}</p>
                    <p className="text-xs text-ink-500">{booking.guestEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-[220px] truncate text-ink-700">
                      {booking.propertyName}
                    </p>
                    <p className="text-xs text-ink-500">{booking.id}</p>
                  </td>
                  <td className="px-6 py-4 text-ink-700">
                    <p>{formatDate(booking.checkIn)}</p>
                    <p className="text-xs text-ink-500">
                      {booking.nights}{" "}
                      {booking.nights === 1 ? "noche" : "noches"}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-ink-900">
                    {formatCurrency(booking.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1",
                        statusStyles[booking.status],
                      )}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      aria-label="Más acciones"
                      className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-zinc-100 hover:text-ink-900"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
