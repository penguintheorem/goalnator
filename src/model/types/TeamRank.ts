import { MatchResult } from './MatchResult'

export type TeamRank = {
  teamName: string
  position: number
  lastMatchResults: MatchResult[]
}
