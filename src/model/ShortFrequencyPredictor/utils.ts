import {
  Match,
  MatchPredictionResultType,
  MatchResult,
  Ranking,
} from '../types'

export const getRankingFactor = (
  teamName: string,
  ranking: Ranking,
): number => {
  const teamRank = ranking.find((rank) => rank.teamName === teamName)

  if (!teamRank) {
    // TODO: Add serious logging
    const error = `Team ${teamName} not found in ranking`
    console.warn(error)
    // TODO: Centralize app errors
    throw new Error(error)
  }

  return ranking.length - teamRank.position
}

export const getHomeAwayFactor = (teamName: string, match: Match): number => {
  return match.homeTeam === teamName ? 3 : 0
}

const getMatchScore = (matchResult: MatchResult): number => {
  switch (matchResult) {
    case MatchResult.WIN:
      return 3
    case MatchResult.DRAW:
      return 1
    default:
      return 0
  }
}

export const getPerformanceFactor = (
  teamName: string,
  ranking: Ranking,
): number => {
  const teamRank = ranking.find((rank) => rank.teamName === teamName)

  if (!teamRank) {
    // TODO: Add serious logging
    const error = `Team ${teamName} not found in ranking`
    console.warn(error)
    // TODO: Centralize app errors
    throw new Error(error)
  }
  const { lastMatchResults } = teamRank

  return lastMatchResults.reduce(
    (acc, matchResult) => acc + getMatchScore(matchResult),
    0,
  )
}

export const getMatchPredictionResult = (
  homeTeamScore: number,
  awayTeamScore: number,
): MatchPredictionResultType => {
  const scoreDiff = homeTeamScore - awayTeamScore
  const WINNER_TRESHOLD = 15
  const DRAW_TRESHOLD = 5

  if (scoreDiff >= WINNER_TRESHOLD) {
    return MatchPredictionResultType.HOME_WIN
  } else if (scoreDiff <= -WINNER_TRESHOLD) {
    return MatchPredictionResultType.AWAY_WIN
  } else if (scoreDiff > DRAW_TRESHOLD && scoreDiff < WINNER_TRESHOLD) {
    return MatchPredictionResultType.HOME_WIN_OR_DRAW
  } else if (scoreDiff < -DRAW_TRESHOLD && scoreDiff > -WINNER_TRESHOLD) {
    return MatchPredictionResultType.AWAY_WIN_OR_DRAW
  }

  return MatchPredictionResultType.POTENTIAL_DRAW
}
