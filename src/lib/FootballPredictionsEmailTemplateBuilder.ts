import { FootballPredictionSystemGenerator } from '@model/FootballPredictionSystemGenerator'
import { EmailTemplateBuilder } from './EmailTemplateBuilder'
import { ChampionshipPredictions, MatchPrediction } from '@model/types'
import Handlebars from 'handlebars'
import { readFileSync } from 'node:fs'
import { formatDate } from 'src/utils/formatDate'

const LAMBDA_TASK_ROOT = process.env.LAMBDA_TASK_ROOT || '/var/task'
const BASIC_PREDICTION_TEMPLATE =
  process.env.AWS_SAM_LOCAL === 'true'
    ? `${LAMBDA_TASK_ROOT}/dist/templates/basicPredictionsEmail.hbs`
    : `${LAMBDA_TASK_ROOT}/templates/basicPredictionsEmail.hbs`

export class FootballPredictionsEmailTemplateBuilder
  implements EmailTemplateBuilder<ChampionshipPredictions>
{
  build(content: ChampionshipPredictions[]): string {
    const templateFile = readFileSync(BASIC_PREDICTION_TEMPLATE, 'utf-8')
    const template = Handlebars.compile<{
      title: string
      championshipPredictions: ChampionshipPredictions[]
      systems: MatchPrediction[][]
    }>(templateFile)
    const emailContent = template({
      title: `Weekly predictions ${formatDate(new Date())}`,
      championshipPredictions: content,
      systems: [
        FootballPredictionSystemGenerator.generateSystem(content, {
          championshipNames: ['Serie A', 'Serie B', 'Premier League'],
          composition: {
            winCount: 2,
            doubleChanceCount: 2,
            drawCount: 2,
          },
        }),
        FootballPredictionSystemGenerator.generateSystem(content, {
          championshipNames: ['La Liga', 'Bundesliga', 'Ligue one'],
          composition: {
            winCount: 2,
            doubleChanceCount: 0,
            drawCount: 4,
          },
        }),
        FootballPredictionSystemGenerator.generateSystem(content, {
          championshipNames: ['Serie A', 'Serie B'],
          composition: {
            winCount: 0,
            doubleChanceCount: 0,
            drawCount: 4,
          },
        }),
      ],
    })

    return emailContent
  }
}
