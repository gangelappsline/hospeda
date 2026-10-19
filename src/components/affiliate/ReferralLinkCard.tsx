import { useState } from 'react'
import { Check, Copy, Share2, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  code: string
  /** URL base pública del registro (sin ?ref=) */
  baseUrl?: string
  compact?: boolean
}

/**
 * Tarjeta con el enlace de referido del afiliado: copiar y compartir.
 */
export default function ReferralLinkCard({
  code,
  baseUrl,
  compact = false,
}: Props) {
  const [copied, setCopied] = useState(false)

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://hospeda.mx'
  const link = `${baseUrl ?? `${origin}/afiliados/registro`}?ref=${encodeURIComponent(code)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Enlace copiado', {
        description: 'Compártelo con tu comunidad para ganar comisiones.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar', {
        description: 'Selecciona y copia el enlace manualmente.',
      })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Únete a Hospeda',
      text: 'Regístrate en Hospeda con mi enlace y sé parte de la comunidad.',
      url: link,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        /* el usuario canceló */
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div
      className={`rounded-xl border border-parchment-200 bg-gradient-to-br from-parchment-50 to-parchment-100 ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-parchment-500/10 flex items-center justify-center text-parchment-600">
          <Link2 size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-cool-steel-900">
            Tu enlace de referido
          </p>
          <p className="text-xs text-cool-steel-500">
            Código: <span className="font-mono font-semibold text-parchment-600">{code}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 min-w-0">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-lg border border-cool-steel-200 bg-white px-3 py-2.5 text-xs font-mono text-cool-steel-700 truncate"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              copied
                ? 'bg-pacific-blue-500 text-white'
                : 'bg-white border border-cool-steel-200 text-cool-steel-700 hover:bg-cool-steel-50'
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-parchment-500 text-sm font-medium text-white hover:bg-parchment-600 transition-colors"
          >
            <Share2 size={15} />
            Compartir
          </button>
        </div>
      </div>
    </div>
  )
}
