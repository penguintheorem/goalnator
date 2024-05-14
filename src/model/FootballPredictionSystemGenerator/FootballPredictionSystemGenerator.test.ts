import { describe, expect, it } from 'vitest'
import { FootballPredictionSystemGenerator } from './FootballPredictionSystemGenerator'
import { MatchPredictionResultType } from '@model/types'

describe('FootballPredictionSystemGenerator', () => {
  describe('generateSystem', () => {
    it('Generates an empty system when the input composition is wrong', () => {
      expect(
        FootballPredictionSystemGenerator.generateSystem([], {
          composition: {
            winCount: 0,
            doubleChanceCount: 0,
            drawCount: 0,
          },
          championshipNames: ['Serie A', 'Serie B', 'Premier League'],
        }),
      ).toEqual([])
    })

    it('Generates an empty system when there are no input championships', () => {
      expect(
        FootballPredictionSystemGenerator.generateSystem([], {
          composition: {
            winCount: 1,
            doubleChanceCount: 1,
            drawCount: 1,
          },
          championshipNames: [],
        }),
      ).toEqual([])
    })

    it('Generates an empty system when the championships are too few for the input composition', () => {
      expect(
        FootballPredictionSystemGenerator.generateSystem([], {
          composition: {
            winCount: 1,
            doubleChanceCount: 1,
            drawCount: 1,
          },
          championshipNames: ['Serie A'],
        }),
      ).toEqual([])
    })

    it('Generates a system for 3 championships with 3 wins (single)', () => {
      const system = FootballPredictionSystemGenerator.generateSystem(
        [
          {
            championshipName: 'Serie A',
            predictions: [
              {
                result: MatchPredictionResultType.HOME_WIN,
              },
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
            ],
          },
          {
            championshipName: 'Serie B',
            predictions: [
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
            ],
          },
          {
            championshipName: 'Premier League',
            predictions: [
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
            ],
          },
        ],
        {
          composition: {
            winCount: 3,
            doubleChanceCount: 0,
            drawCount: 0,
          },
          championshipNames: ['Serie A', 'Serie B', 'Premier League'],
        },
      )

      expect(system).toHaveLength(3)
      expect(
        system.filter(
          (match) =>
            match.result === MatchPredictionResultType.HOME_WIN ||
            match.result === MatchPredictionResultType.AWAY_WIN,
        ),
      ).toHaveLength(3)
    })

    it('Generates a system for 3 championships with a mix of 1 win, 1 double chance, 1 draw', () => {
      const system = FootballPredictionSystemGenerator.generateSystem(
        [
          {
            championshipName: 'Serie A',
            predictions: [
              {
                result: MatchPredictionResultType.HOME_WIN,
              },
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.HOME_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Serie B',
            predictions: [
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Premier League',
            predictions: [
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
            ],
          },
        ],
        {
          composition: {
            winCount: 1,
            doubleChanceCount: 1,
            drawCount: 1,
          },
          championshipNames: ['Serie A', 'Serie B', 'Premier League'],
        },
      )

      expect(system).toHaveLength(3)
      expect(
        system.filter(
          (match) =>
            match.result === MatchPredictionResultType.HOME_WIN ||
            match.result === MatchPredictionResultType.AWAY_WIN,
        ),
      ).toHaveLength(1)
      expect(
        system.filter(
          (match) =>
            match.result === MatchPredictionResultType.HOME_WIN_OR_DRAW ||
            match.result === MatchPredictionResultType.AWAY_WIN_OR_DRAW,
        ),
      ).toHaveLength(1)
      expect(
        system.filter(
          (match) => match.result === MatchPredictionResultType.POTENTIAL_DRAW,
        ),
      ).toHaveLength(1)
    })

    it('Generates a system for 3 championships with a mix of 1 win, 2 double chance', () => {
      const system = FootballPredictionSystemGenerator.generateSystem(
        [
          {
            championshipName: 'Serie A',
            predictions: [
              {
                result: MatchPredictionResultType.HOME_WIN,
              },
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.HOME_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Serie B',
            predictions: [
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Premier League',
            predictions: [
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
            ],
          },
        ],
        {
          composition: {
            winCount: 1,
            doubleChanceCount: 2,
            drawCount: 0,
          },
          championshipNames: ['Serie A', 'Serie B', 'Premier League'],
        },
      )

      expect(system).toHaveLength(3)
      expect(
        system.filter(
          (match) =>
            match.result === MatchPredictionResultType.HOME_WIN ||
            match.result === MatchPredictionResultType.AWAY_WIN,
        ),
      ).toHaveLength(1)
      expect(
        system.filter(
          (match) =>
            match.result === MatchPredictionResultType.HOME_WIN_OR_DRAW ||
            match.result === MatchPredictionResultType.AWAY_WIN_OR_DRAW,
        ),
      ).toHaveLength(2)
    })

    it('Generates a system for 6 championships with a mix of 2 win, 2 double chance, 2 raw', () => {
      const system = FootballPredictionSystemGenerator.generateSystem(
        [
          {
            championshipName: 'Serie A',
            predictions: [
              {
                result: MatchPredictionResultType.HOME_WIN,
              },
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.HOME_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Serie B',
            predictions: [
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Premier League',
            predictions: [
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
            ],
          },
          {
            championshipName: 'La Liga',
            predictions: [
              {
                result: MatchPredictionResultType.HOME_WIN,
              },
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.HOME_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Eredivisie',
            predictions: [
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN_OR_DRAW,
              },
            ],
          },
          {
            championshipName: 'Czech Liga',
            predictions: [
              {
                result: MatchPredictionResultType.POTENTIAL_DRAW,
              },
              {
                result: MatchPredictionResultType.AWAY_WIN,
              },
            ],
          },
        ],
        {
          composition: {
            winCount: 2,
            doubleChanceCount: 2,
            drawCount: 2,
          },
          championshipNames: [
            'Serie A',
            'Serie B',
            'Premier League',
            'La Liga',
            'Eredivisie',
            'Czech Liga',
          ],
        },
      )

      expect(system).toHaveLength(6)
      expect(
        system.filter(
          (match) =>
            match.result === MatchPredictionResultType.HOME_WIN ||
            match.result === MatchPredictionResultType.AWAY_WIN,
        ),
      ).toHaveLength(2)
      expect(
        system.filter(
          (match) =>
            match.result === MatchPredictionResultType.HOME_WIN_OR_DRAW ||
            match.result === MatchPredictionResultType.AWAY_WIN_OR_DRAW,
        ),
      ).toHaveLength(2)
      expect(
        system.filter(
          (match) => match.result === MatchPredictionResultType.POTENTIAL_DRAW,
        ),
      ).toHaveLength(2)
    })
  })
})
