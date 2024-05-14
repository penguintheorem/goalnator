import { MatchPredictionMetadata } from './MatchPredictionMetadata'
import { MatchPredictionResultType } from './MatchPredictionResult'

export type MatchPrediction = {
  result: MatchPredictionResultType
  resultProbability?: number
  metadata?: MatchPredictionMetadata
}
