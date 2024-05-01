import { Match, MatchDay, MatchPrediction, Ranking } from './types'

export interface FootballPredictionEngine {
  getMatchprediction: (match: Match, ranking: Ranking) => MatchPrediction
  getMatchDayPrediction: (
    matchDay: MatchDay,
    ranking: Ranking,
  ) => MatchPrediction[]
}
