import { ChampionshipName } from './ChampionshipName'
import { MatchDay } from './MatchDay'
import { Ranking } from './Ranking'

export type ChampionshipStats = {
  championshipName: ChampionshipName
  ranking: Ranking
  matchDay: MatchDay
}
