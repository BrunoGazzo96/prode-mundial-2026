import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'

interface Props {
  inviteCode: string
}

export function ShareLink({ inviteCode }: Props) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/unirse/${inviteCode}`

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700">
      <Share2 className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="text-sm text-slate-300 truncate flex-1">{url}</span>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0"
      >
        {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
      </button>
    </div>
  )
}
