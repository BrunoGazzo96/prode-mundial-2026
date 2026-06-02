import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Match } from '../types/database'

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true })
      .then(({ data }) => {
        setMatches(data ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel('matches-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        setMatches((prev) =>
          prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
        )
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { matches, loading }
}
