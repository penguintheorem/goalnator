import { ChampionshipName } from './ChampionshipName'
import { MatchPrediction } from './MatchPrediction'

export type ChampionshipPredictions = {
  championshipName: ChampionshipName
  predictions: MatchPrediction[]
}
