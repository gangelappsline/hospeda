import { Heart, Star } from "lucide-react";

import type { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group cursor-pointer">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={property.title}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />

        {property.superhost ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-900 shadow-sm">
            Superanfitrión
          </span>
        ) : null}

        <button
          type="button"
          aria-label="Guardar en favoritos"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/35"
        >
          <Heart className="size-4" />
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold text-ink-900">
            {property.city}, {property.country}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm text-ink-900">
            <Star className="size-3.5 fill-ink-900" />
            {property.rating.toFixed(2)}
          </span>
        </div>
        <p className="truncate text-sm text-ink-500">{property.title}</p>
        <p className="text-sm text-ink-500">
          {property.guests} huéspedes · {property.bedrooms} recámaras
        </p>
        <p className="pt-1 text-[15px] text-ink-900">
          <span className="font-semibold">{formatCurrency(property.pricePerNight)}</span>{" "}
          <span className="text-ink-500">noche</span>
        </p>
      </div>
    </article>
  );
}
