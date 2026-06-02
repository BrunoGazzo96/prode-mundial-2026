export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type MatchStage =
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'FINAL'

export type MatchStatus = 'SCHEDULED' | 'IN_PLAY' | 'FINISHED'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; created_at: string }
        Insert: { id: string; display_name: string; created_at?: string }
        Update: { display_name?: string }
      }
      groups: {
        Row: { id: string; name: string; invite_code: string; created_at: string }
        Insert: { id?: string; name: string; invite_code: string; created_at?: string }
        Update: { name?: string }
      }
      group_members: {
        Row: { id: string; group_id: string; user_id: string; role: string; joined_at: string }
        Insert: { id?: string; group_id: string; user_id: string; role?: string; joined_at?: string }
        Update: { role?: string }
      }
      matches: {
        Row: {
          id: string
          api_id: number | null
          home_team: string
          away_team: string
          home_team_crest: string | null
          away_team_crest: string | null
          match_date: string
          stage: MatchStage
          group_name: string | null
          home_score: number | null
          away_score: number | null
          status: MatchStatus
          updated_at: string
        }
        Insert: {
          id?: string
          api_id?: number | null
          home_team: string
          away_team: string
          home_team_crest?: string | null
          away_team_crest?: string | null
          match_date: string
          stage: MatchStage
          group_name?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: MatchStatus
          updated_at?: string
        }
        Update: {
          home_score?: number | null
          away_score?: number | null
          status?: MatchStatus
          updated_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          group_id: string
          match_id: string
          predicted_home: number
          predicted_away: number
          points: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          match_id: string
          predicted_home: number
          predicted_away: number
          points?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          predicted_home?: number
          predicted_away?: number
          points?: number | null
          updated_at?: string
        }
      }
      champion_predictions: {
        Row: {
          id: string
          user_id: string
          group_id: string
          team_name: string
          team_crest: string | null
          points: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          team_name: string
          team_crest?: string | null
          points?: number | null
          created_at?: string
        }
        Update: {
          team_name?: string
          team_crest?: string | null
          points?: number | null
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Prediction = Database['public']['Tables']['predictions']['Row']
export type ChampionPrediction = Database['public']['Tables']['champion_predictions']['Row']
