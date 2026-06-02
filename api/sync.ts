import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { calcMatchPoints } from '../src/lib/scoring.js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const FD_BASE = 'https://api.football-data.org/v4'

interface FDMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  homeTeam: { name: string; crest: string; tla: string }
  awayTeam: { name: string; crest: string; tla: string }
  score: {
    fullTime: { home: number | null; away: number | null }
  }
}

function mapStage(stage: string): string {
  const map: Record<string, string> = {
    'GROUP_STAGE': 'GROUP_STAGE',
    'ROUND_OF_32': 'ROUND_OF_32',
    'ROUND_OF_16': 'ROUND_OF_16',
    'QUARTER_FINALS': 'QUARTER_FINALS',
    'SEMI_FINALS': 'SEMI_FINALS',
    'FINAL': 'FINAL',
    'THIRD_PLACE': 'FINAL',
  }
  return map[stage] ?? 'GROUP_STAGE'
}

function mapStatus(status: string): string {
  if (status === 'FINISHED' || status === 'AWARDED') return 'FINISHED'
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'IN_PLAY'
  return 'SCHEDULED'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow manual trigger with POST from admin, or cron calls
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    const fdRes = await fetch(`${FD_BASE}/competitions/WC/matches`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
    })

    if (!fdRes.ok) {
      return res.status(502).json({ error: `football-data.org error: ${fdRes.status}` })
    }

    const json = await fdRes.json()
    const matches: FDMatch[] = json.matches ?? []

    // Upsert matches
    const rows = matches.map((m) => ({
      api_id: m.id,
      home_team: m.homeTeam.name ?? 'TBD',
      away_team: m.awayTeam.name ?? 'TBD',
      home_team_crest: m.homeTeam.crest ?? null,
      away_team_crest: m.awayTeam.crest ?? null,
      match_date: m.utcDate,
      stage: mapStage(m.stage),
      group_name: m.group ? m.group.replace('GROUP_', '') : null,
      home_score: m.score.fullTime.home,
      away_score: m.score.fullTime.away,
      status: mapStatus(m.status),
      updated_at: new Date().toISOString(),
    }))

    const { error: upsertError } = await supabase
      .from('matches')
      .upsert(rows, { onConflict: 'api_id' })

    if (upsertError) throw upsertError

    // Recalculate points for finished matches
    const finishedApiIds = matches
      .filter((m) => mapStatus(m.status) === 'FINISHED' && m.score.fullTime.home !== null)
      .map((m) => m.id)

    if (finishedApiIds.length > 0) {
      const { data: finishedMatches } = await supabase
        .from('matches')
        .select('id, home_score, away_score')
        .in('api_id', finishedApiIds)

      for (const match of finishedMatches ?? []) {
        const { data: preds } = await supabase
          .from('predictions')
          .select('id, predicted_home, predicted_away')
          .eq('match_id', match.id)
          .is('points', null)

        for (const pred of preds ?? []) {
          const pts = calcMatchPoints(pred.predicted_home, pred.predicted_away, match.home_score!, match.away_score!)
          await supabase.from('predictions').update({ points: pts }).eq('id', pred.id)
        }
      }
    }

    res.status(200).json({ synced: rows.length, finished: finishedApiIds.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'sync failed' })
  }
}
