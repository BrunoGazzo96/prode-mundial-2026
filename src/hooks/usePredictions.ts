import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Prediction, ChampionPrediction } from '../types/database'

export function usePredictions(groupId: string | null, userId: string | null) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [champion, setChampion] = useState<ChampionPrediction | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!groupId || !userId) return
    const [predsRes, champRes] = await Promise.all([
      supabase.from('predictions').select('*').eq('group_id', groupId).eq('user_id', userId),
      supabase.from('champion_predictions').select('*').eq('group_id', groupId).eq('user_id', userId).maybeSingle(),
    ])
    setPredictions(predsRes.data ?? [])
    setChampion(champRes.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [groupId, userId])

  async function savePrediction(matchId: string, predictedHome: number, predictedAway: number) {
    if (!groupId || !userId) return
    const { data } = await supabase
      .from('predictions')
      .upsert({ user_id: userId, group_id: groupId, match_id: matchId, predicted_home: predictedHome, predicted_away: predictedAway, updated_at: new Date().toISOString() }, { onConflict: 'user_id,match_id,group_id' })
      .select()
      .single()
    if (data) setPredictions((prev) => [...prev.filter((p) => p.match_id !== matchId), data])
  }

  async function saveChampion(teamName: string, teamCrest?: string) {
    if (!groupId || !userId) return
    const { data } = await supabase
      .from('champion_predictions')
      .upsert({ user_id: userId, group_id: groupId, team_name: teamName, team_crest: teamCrest ?? null }, { onConflict: 'user_id,group_id' })
      .select()
      .single()
    if (data) setChampion(data)
  }

  return { predictions, champion, loading, savePrediction, saveChampion, reload: load }
}
