import { EmailSender } from '@lib/EmailSender'
import { FootballPredictionsEmailTemplateBuilder } from '@lib/FootballPredictionsEmailTemplateBuilder'
import { SimpleEmailServiceClient } from '@lib/SimpleEmailServiceClient'
import { WebScraper } from '@lib/WebScraper'
import { WebScraperPuppeteer } from '@lib/WebScraperPuppeteer'
import { WebScrapingConfig } from '@lib/types/WebScrapingConfig'
import { FootballPredictionEngine } from '@model/FootballPredictionEngine'
import { ShortFrequencyPredictor } from '@model/ShortFrequencyPredictor'
import { ChampionshipPredictions, ChampionshipStats } from '@model/types'
import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  EventBridgeEvent,
} from 'aws-lambda'
import dotenv from 'dotenv'
import configs from './config/web-scraping-config.json'
import { formatDate } from './utils/formatDate'

dotenv.config()

console.log(`configs: ${JSON.stringify(process.env, null, 2)}`)

const getStats = async (
  config: WebScrapingConfig[],
): Promise<ChampionshipStats[]> => {
  const webScraper: WebScraper = new WebScraperPuppeteer()
  const stats: ChampionshipStats[] = []

  for (const championshipConfig of config) {
    // TODO: replace with a good logger
    const { championshipName } = championshipConfig
    console.log(`START Getting stats for championship ${championshipName}`)

    const ranking = await webScraper.getRanking(championshipConfig.rankingUrl)
    const matchDay = await webScraper.getMatchDay(
      championshipConfig.nextMatchDayUrl,
    )

    stats.push({ championshipName, ranking, matchDay })
    console.log(`FINISH Getting stats for championship ${championshipName}`)
  }

  return stats
}

const getPredictions = (
  stats: ChampionshipStats[],
): ChampionshipPredictions[] => {
  const predictions: ChampionshipPredictions[] = []

  for (const { championshipName, ranking, matchDay } of stats) {
    const footballPredictionEngine: FootballPredictionEngine =
      new ShortFrequencyPredictor()

    const matchPredictions = footballPredictionEngine.getMatchDayPrediction(
      matchDay,
      ranking,
    )

    predictions.push({ championshipName, predictions: matchPredictions })
  }

  return predictions
}

const sendEmail = (
  predictions: ChampionshipPredictions[],
): Promise<boolean> => {
  const emailSender: EmailSender<string> = new SimpleEmailServiceClient(
    process.env.AWS_REGION,
    process.env.SENDER_EMAIL,
  )
  const emailContent = new FootballPredictionsEmailTemplateBuilder().build(
    predictions,
  )

  const targetEmails = JSON.parse(process.env.TARGET_EMAILS_JSON)
  return emailSender.sendEmail(
    targetEmails,
    emailContent,
    `Goalnator Weekly predictions - ${formatDate(new Date())}`,
  )
}

// TODO: configure a custom logger here
export const handler = async (
  event: EventBridgeEvent<string, any> | APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // FEATURE: add validation
  // we may accept only the championship predictions that we are expecting
  const webScrapingConfigs: WebScrapingConfig[] = configs
  const stats = await getStats(webScrapingConfigs)
  const predictions = getPredictions(stats)
  const emailSendingResult = await sendEmail(predictions)

  if (!emailSendingResult) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error sending email',
      }),
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'ok',
    }),
  }
}
