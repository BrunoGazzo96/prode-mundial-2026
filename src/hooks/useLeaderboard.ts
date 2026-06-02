import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface LeaderboardEntry {
  userId: string
  displayName: string
  matchPoints: number
  championPoints: number
  total: number
  predictionsCount: number
}

export function useLeaderboard(groupId: string | null) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!groupId) return
    setLoading(true)

    const [membersRes, predictionsRes, championRes] = await Promise.all([
      supabase.from('group_members').select('user_id').eq('group_id', groupId),
      supabase.from('predictions').select('user_id, points').eq('group_id', groupId),
      supabase.from('champion_predictions').select('user_id, points').eq('group_id', groupId),
    ])

    const members = membersRes.data ?? []
    const predictions = predictionsRes.data ?? []
    const champions = championRes.data ?? []

    // Fetch profiles separately (no direct FK between group_members and profiles)
    const userIds = members.map((m) => m.user_id)
    const profilesRes = userIds.length > 0
      ? await supabase.from('profiles').select('id, display_name').in('id', userIds)
      : { data: [] }
    const profiles = profilesRes.data ?? []

    const result: LeaderboardEntry[] = members.map((m) => {
      const preds = predictions.filter((p) => p.user_id === m.user_id)
      const champ = champions.find((c) => c.user_id === m.user_id)
      const matchPoints = preds.reduce((sum, p) => sum + (p.points ?? 0), 0)
      const championPoints = champ?.points ?? 0
      const profile = profiles.find((p) => p.id === m.user_id)
      return {
        userId: m.user_id,
        displayName: profile?.display_name ?? 'Jugador',
        matchPoints,
        championPoints,
        total: matchPoints + championPoints,
        predictionsCount: preds.length,
      }
    })

    result.sort((a, b) => b.total - a.total)
    setEntries(result)
    setLoading(false)
  }

  useEffect(() => {
    load()

    if (!groupId) return
    const channel = supabase
      .channel(`leaderboard-${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions', filter: `group_id=eq.${groupId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'champion_predictions', filter: `group_id=eq.${groupId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  return { entries, loading, reload: load }
}
