import { ChampionshipName } from '@model/types/ChampionshipName'

type WebScrapingConfig = {
  countryCode: string
  championshipName: ChampionshipName
  rankingUrl: string
  nextMatchDayUrl: string
  numberOfTeams: number
}

export type WebScrapingConfigs = WebScrapingConfig[]
