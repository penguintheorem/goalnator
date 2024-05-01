import { FootballPredictionEngine } from '../FootballPredictionEngine'
import { Match, MatchDay, MatchPrediction, Ranking } from '../types'
import {
  getHomeAwayFactor,
  getMatchPredictionResult,
  getPerformanceFactor,
  getRankingFactor,
} from './utils'

/**
 * Analyzes the results of the last 5 matches plus ranking to predict the outcome of a football match.
 *
 * The predictor cannot work in case there are not enough matches to analyze.
 * The predictor takes into consideration the following factors:
 *  - Ranking factor = (teams number - team position)pt
 *  - HomeAway factor = 3pt
 *  - Performance factor = 3pt per win, 1pt per draw, 0pt per loss. Sum over last 5 matches.
 */
export class ShortFrequencyPredictor implements FootballPredictionEngine {
  private getTeamScore(
    teamName: string,
    match: Match,
    ranking: Ranking,
  ): number {
    const rankingFactor = getRankingFactor(teamName, ranking)
    const homeAwayFactor = getHomeAwayFactor(teamName, match)
    const performanceFactor = getPerformanceFactor(teamName, ranking)

    return rankingFactor + homeAwayFactor + performanceFactor
  }

  // TODO: ideally separe Ranking/Stats (last 5 matches)
  getMatchprediction(match: Match, ranking: Ranking): MatchPrediction {
    const { homeTeam, awayTeam, matchTime } = match
    const homeTeamScore = this.getTeamScore(homeTeam, match, ranking)
    const awayTeamScore = this.getTeamScore(awayTeam, match, ranking)
    const matchPrediction = getMatchPredictionResult(
      homeTeamScore,
      awayTeamScore,
    )

    return {
      result: matchPrediction,
      // TODO: implement probability calculation
      resultProbability: 1,
      metadata: {
        homeTeamWinScore: homeTeamScore,
        awayTeamWinScore: awayTeamScore,
        scoringDiff: homeTeamScore - awayTeamScore,
        homeTeamWinProbability: 1,
        awayTeamWinProbability: 1,
        drawProbability: 1,
        homeTeam,
        awayTeam,
        matchTime,
      },
    }
  }

  getMatchDayPrediction(
    matchDay: MatchDay,
    ranking: Ranking,
  ): MatchPrediction[] {
    return matchDay.map((match) => this.getMatchprediction(match, ranking))
  }
}
