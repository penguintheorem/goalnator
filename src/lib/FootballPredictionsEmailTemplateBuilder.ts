import { EmailTemplateBuilder } from './EmailTemplateBuilder'
import { ChampionshipPredictions } from '@model/types'
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
    }>(templateFile)
    const emailContent = template({
      title: `Weekly predictions ${formatDate(new Date())}`,
      championshipPredictions: content,
    })

    return emailContent
  }
}
