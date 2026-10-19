# Paleta de color de Hospeda

Sistema de color único del proyecto. Vive en `src/index.css` dentro de `@theme`
(Tailwind v4) y **toda** la interfaz consume sus tokens: no se usan colores
sueltos de Tailwind (`gray-*`, `blue-*`, `orange-*`, …) ni hexadecimales en
componentes.

## 1. Las cinco familias

| Familia | Rol | Uso típico |
|---|---|---|
| `cool-steel` | Neutro frío principal | Texto, bordes, fondos de panel, sidebar, tablas |
| `vivid-tangerine` | Acento primario de marca | CTAs, enlaces, focos, marca, estados destructivos |
| `tangerine-dream` | Acento cálido secundario | Advertencias y procesos en curso |
| `pacific-blue` | Acento fresco | Información, éxito, tendencias positivas |
| `parchment` | Neutro cálido | Superficies del sitio público, estados pendientes |

Cada familia tiene escala completa `50 → 950`.

## 2. Alias semánticos

Cuando el color comunica un **rol** y no un tono, se usa el alias. Así el
significado no depende de un número de escala.

| Token | Equivale a | Cuándo usarlo |
|---|---|---|
| `brand` / `brand-strong` / `brand-deep` | `vivid-tangerine-500 / 600 / 700` | Acción principal, hover, énfasis |
| `brand-soft` / `brand-line` | `vivid-tangerine-50 / 200` | Fondos y bordes de marca |
| `success` / `success-soft` / `success-line` | `pacific-blue-700 / 50 / 200` | Estados activos, confirmaciones |
| `info` / `info-soft` / `info-line` | `pacific-blue-600 / 50 / 200` | Mensajes informativos |
| `warning` / `warning-soft` / `warning-line` | `tangerine-dream-700 / 50 / 200` | Procesos en curso, avisos |
| `danger` / `danger-soft` / `danger-line` | `vivid-tangerine-700 / 50 / 200` | Errores, acciones destructivas |
| `pending` / `pending-soft` / `pending-line` | `parchment-700 / 50 / 200` | Estados pendientes / neutral cálido |
| `surface` | `#ffffff` | Tarjetas, modales, inputs |
| `surface-muted` | `cool-steel-50` | Fondo de app, barras de búsqueda |
| `surface-warm` | `parchment-50` | Fondo de páginas públicas |
| `line` / `line-soft` | `cool-steel-200 / 100` | Bordes |
| `ink` / `ink-soft` | `cool-steel-900 / 700` | Texto principal / secundario |
| `muted` / `subtle` | `cool-steel-500 / 400` | Texto atenuado, iconos |
| `overlay` | `cool-steel-950` | Fondo de modales (`bg-overlay/60`) |

## 3. Reglas de aplicación

1. **Nunca** usar `gray-*`, `slate-*`, `zinc-*`, `neutral-*`, `stone-*`, `red-*`,
   `orange-*`, `amber-*`, `yellow-*`, `green-*`, `emerald-*`, `teal-*`,
   `cyan-*`, `sky-*`, `blue-*`, `indigo-*`, `violet-*`, `purple-*`,
   `fuchsia-*`, `pink-*` ni `rose-*`.
2. **Nunca** escribir hexadecimales en componentes. Si un gráfico, SVG o
   `style` necesita un color, usar `var(--color-…)`.
3. `white` se conserva únicamente como **superficie de tarjeta/input** y como
   **texto sobre fondo de marca**. Para el resto, usar `surface` y `ink`.
4. `bg-black` no se usa: los overlays son `bg-overlay/60`.
5. Fondos de página pública: `bg-surface-warm`. Fondo de paneles internos:
   `bg-surface-muted`.
6. Estados y badges: alias semánticos (`success`, `warning`, `danger`,
   `pending`), no tonos sueltos.

## 4. Dónde se aplica

- **Componentes** (`src/components/**`, `src/pages/**`): clases de la paleta y
  alias semánticos.
- **Gráficas** (`RevenueChart`): `var(--color-brand)`, `var(--color-line-soft)`,
  `var(--color-subtle)` y tooltip con `surface`/`line`/`ink`.
- **Mapa decorativo** (`SearchResultsMap`): gradientes con tokens de
  `pacific-blue`, `vivid-tangerine` y `parchment`.
- **Toasts** (sonner): variables `--normal-*`, `--success-*`, `--info-*`,
  `--warning-*` y `--error-*` redefinidas con la paleta en `index.css`.
- **Estilos globales**: `body` usa `surface-warm` + `ink`; `::selection` y
  scrollbar usan la paleta.
- **PWA** (`index.html`, `site.webmanifest`): `theme-color` = `vivid-tangerine-500`,
  `background_color` = `parchment-50`.

## 5. Cómo cambiar la paleta en el futuro

1. Editar los valores hexadecimales de las cinco familias en `src/index.css`.
2. Si cambia la correspondencia semántica, ajustar solo el bloque de alias.
3. No hace falta tocar componentes: todos consumen tokens.

## 6. Verificación

```bash
# No debe devolver nada (hex fuera de index.css)
grep -rnoE "#[0-9a-fA-F]{3,8}\b" src --include="*.tsx" --include="*.ts"

# No debe devolver nada (clases de paletas ajenas)
grep -rnoE "(bg|text|border|ring|from|via|to|fill|stroke)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink|rose)-[0-9]{2,3}" src --include="*.tsx"

# Tampoco bg-black
grep -rn "bg-black" src --include="*.tsx"
```
