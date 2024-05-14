import {
  ChampionshipPredictions,
  MatchPrediction,
  MatchPredictionResultType,
} from '../types'
import { FootballPredictionSystemRisk } from './FootballPredictionSystemRisk'
import { ChampionshipName } from '../types/ChampionshipName'
import { shuffle } from 'src/utils/shuffle'

/**
 * Describes the compsosition a system should have.
 * Number of winCount (1, 2), drawCount (X), doubleChanceCount (1X, X2)
 */
type FootballPredictionSystemComposition = {
  winCount: number
  drawCount: number
  doubleChanceCount: number
}

type FootballPredictionSystemOptions = {
  composition: FootballPredictionSystemComposition
  championshipNames: ChampionshipName[]
  // TODO: to be implemented based on probability, it won't be used for now
  risk?: FootballPredictionSystemRisk
}

type FootballPredictionsByResult = {
  winPredictions: MatchPrediction[]
  doubleChancePredictions: MatchPrediction[]
  drawPredictions: MatchPrediction[]
}

export class FootballPredictionSystemGenerator {
  private static getPredictionsPerResult(
    championshipPredictions: ChampionshipPredictions[],
  ): FootballPredictionsByResult {
    const predictionsByResult =
      championshipPredictions.reduce<FootballPredictionsByResult>(
        (
          allPredictionsByResult: FootballPredictionsByResult,
          championshipPredictions: ChampionshipPredictions,
        ) => {
          const { predictions: matchPredictions } = championshipPredictions

          return {
            winPredictions: [
              ...allPredictionsByResult.winPredictions,
              ...matchPredictions.filter(
                (matchPrediction) =>
                  matchPrediction.result ===
                    MatchPredictionResultType.HOME_WIN ||
                  matchPrediction.result === MatchPredictionResultType.AWAY_WIN,
              ),
            ],
            doubleChancePredictions: [
              ...allPredictionsByResult.doubleChancePredictions,
              ...matchPredictions.filter(
                (matchPrediction) =>
                  matchPrediction.result ===
                    MatchPredictionResultType.HOME_WIN_OR_DRAW ||
                  matchPrediction.result ===
                    MatchPredictionResultType.AWAY_WIN_OR_DRAW,
              ),
            ],
            drawPredictions: [
              ...allPredictionsByResult.drawPredictions,
              ...matchPredictions.filter(
                (matchPrediction) =>
                  matchPrediction.result ===
                  MatchPredictionResultType.POTENTIAL_DRAW,
              ),
            ],
          }
        },
        {
          winPredictions: [],
          doubleChancePredictions: [],
          drawPredictions: [],
        },
      )

    return {
      winPredictions: shuffle(predictionsByResult.winPredictions),
      doubleChancePredictions: shuffle(
        predictionsByResult.doubleChancePredictions,
      ),
      drawPredictions: shuffle(predictionsByResult.drawPredictions),
    }
  }

  static generateSystem(
    predictions: ChampionshipPredictions[],
    options: FootballPredictionSystemOptions,
  ): MatchPrediction[] {
    const { composition, championshipNames } = options
    const size =
      composition.winCount +
      composition.drawCount +
      composition.doubleChanceCount

    if (!size || !championshipNames.length || size < championshipNames.length) {
      // TODO: add a proper logger + validation
      console.warn(
        'Invalid composition or championship names, will generate an empty system',
      )
      return []
    }

    const predictionsByResult = this.getPredictionsPerResult(
      predictions.filter(({ championshipName }) =>
        championshipNames.includes(championshipName),
      ),
    )
    const systemPredictions: MatchPrediction[] = []

    systemPredictions.push(
      ...predictionsByResult.winPredictions.slice(0, composition.winCount),
    )
    systemPredictions.push(
      ...predictionsByResult.drawPredictions.slice(0, composition.drawCount),
    )
    systemPredictions.push(
      ...predictionsByResult.doubleChancePredictions.slice(
        0,
        composition.doubleChanceCount,
      ),
    )

    return systemPredictions
  }
}
