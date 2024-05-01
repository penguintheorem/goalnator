import { describe, expect, it } from 'vitest'
import {
  Match,
  MatchPredictionResultType,
  MatchResult,
  Ranking,
} from '@model/types'
import {
  getHomeAwayFactor,
  getMatchPredictionResult,
  getPerformanceFactor,
  getRankingFactor,
} from './utils'

describe('ShortFrequencyPredictor/utils', () => {
  describe('getRankingFactor', () => {
    it('Throws an error when the team name is not present in the ranking', () => {
      const teamName = 'notPresentTeamName'
      const ranking: Ranking = [
        { teamName: 'team1', position: 1, lastMatchResults: [] },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
      ]

      expect(() => getRankingFactor(teamName, ranking)).toThrowError()
    })

    it('Returns the difference between ranking length and position', () => {
      const ranking: Ranking = [
        { teamName: 'team1', position: 1, lastMatchResults: [] },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
        { teamName: 'team3', position: 3, lastMatchResults: [] },
        { teamName: 'team4', position: 4, lastMatchResults: [] },
        { teamName: 'team5', position: 5, lastMatchResults: [] },
      ]

      expect(getRankingFactor('team1', ranking)).toBe(4)
      expect(getRankingFactor('team3', ranking)).toBe(2)
      expect(getRankingFactor('team5', ranking)).toBe(0)
    })
  })

  describe('getHomeAwayFactor', () => {
    it('Returns 3 when the team is the home team', () => {
      const teamName = 'team1'
      const match: Match = {
        homeTeam: teamName,
        awayTeam: 'team2',
        matchTime: 'date',
      }

      expect(getHomeAwayFactor(teamName, match)).toBe(3)
    })

    it('Returns 0 when the team is the away team', () => {
      const teamName = 'team1'
      const match: Match = {
        homeTeam: 'team2',
        awayTeam: teamName,
        matchTime: 'date',
      }

      expect(getHomeAwayFactor(teamName, match)).toBe(0)
    })
  })

  describe('getPerformanceFactor', () => {
    it('Returns 3 when the last match result is a win', () => {
      const teamName = 'team1'
      const ranking: Ranking = [
        { teamName: 'team1', position: 1, lastMatchResults: [MatchResult.WIN] },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
      ]

      expect(getPerformanceFactor(teamName, ranking)).toBe(3)
    })

    it('Returns 1 when the last match result is a draw', () => {
      const teamName = 'team1'
      const ranking: Ranking = [
        {
          teamName: 'team1',
          position: 1,
          lastMatchResults: [MatchResult.DRAW],
        },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
      ]

      expect(getPerformanceFactor(teamName, ranking)).toBe(1)
    })

    it('Returns 0 when the last match result is a loss', () => {
      const teamName = 'team1'
      const ranking: Ranking = [
        {
          teamName: 'team1',
          position: 1,
          lastMatchResults: [MatchResult.LOSS],
        },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
      ]

      expect(getPerformanceFactor(teamName, ranking)).toBe(0)
    })

    it('Returns the sum of the last 5 match score (5)', () => {
      const teamName = 'team1'
      const ranking: Ranking = [
        {
          teamName: 'team1',
          position: 1,
          lastMatchResults: [
            MatchResult.WIN,
            MatchResult.LOSS,
            MatchResult.DRAW,
            MatchResult.LOSS,
            MatchResult.DRAW,
          ],
        },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
      ]

      expect(getPerformanceFactor(teamName, ranking)).toBe(5)
    })

    it('Returns 0 if there are no previous matches', () => {
      const teamName = 'team1'
      const ranking: Ranking = [
        {
          teamName: 'team1',
          position: 1,
          lastMatchResults: [],
        },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
      ]

      expect(getPerformanceFactor(teamName, ranking)).toBe(0)
    })

    it('Throws an error if the team was not found in the ranking', () => {
      const teamName = 'team1'
      const ranking: Ranking = [
        {
          teamName: 'team3',
          position: 1,
          lastMatchResults: [],
        },
        { teamName: 'team2', position: 2, lastMatchResults: [] },
      ]

      expect(() => getPerformanceFactor(teamName, ranking)).toThrowError()
    })
  })

  describe('getMatchPredictionResult', () => {
    it('Returns 1 as result (home win)', () => {
      expect(getMatchPredictionResult(25, 5)).toBe(
        MatchPredictionResultType.HOME_WIN,
      )
    })

    it('Returns 1X as result (home win or draw)', () => {
      expect(getMatchPredictionResult(25, 18)).toBe(
        MatchPredictionResultType.HOME_WIN_OR_DRAW,
      )
    })

    it('Returns 2 as result (away win)', () => {
      expect(getMatchPredictionResult(5, 25)).toBe(
        MatchPredictionResultType.AWAY_WIN,
      )
    })

    it('Returns X2 as result (away win or draw)', () => {
      expect(getMatchPredictionResult(18, 25)).toBe(
        MatchPredictionResultType.AWAY_WIN_OR_DRAW,
      )
    })

    it('Returns X as result (draw)', () => {
      expect(getMatchPredictionResult(15, 15)).toBe(
        MatchPredictionResultType.POTENTIAL_DRAW,
      )
    })
  })
})
