import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getFlagUrl } from '../data/isoFlags'

export interface Team {
  name: string
  flagUrl: string
}

export function useTeamsFromMatches(): Team[] {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    supabase
      .from('matches')
      .select('home_team, away_team')
      .neq('home_team', 'TBD')
      .neq('away_team', 'TBD')
      .then(({ data }) => {
        const names = new Set<string>()
        data?.forEach((m) => {
          if (m.home_team) names.add(m.home_team)
          if (m.away_team) names.add(m.away_team)
        })
        const sorted = Array.from(names)
          .sort((a, b) => a.localeCompare(b))
          .map((name) => ({ name, flagUrl: getFlagUrl(name) }))
        setTeams(sorted)
      })
  }, [])

  return teams
}
