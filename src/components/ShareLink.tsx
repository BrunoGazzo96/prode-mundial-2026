import { useState } from 'react'
import { Copy, Check, Link2 } from 'lucide-react'

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
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/60">
      <Link2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
      <span className="text-xs text-slate-500 truncate flex-1 font-mono">{inviteCode}</span>
      <button
        onClick={copy}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
          copied
            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
            : 'bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30'
        }`}
      >
        {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar link</>}
      </button>
    </div>
  )
}
