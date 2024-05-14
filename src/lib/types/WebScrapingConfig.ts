import { ChampionshipName } from '@model/types/ChampionshipName'

export type WebScrapingConfig = {
  countryCode: string
  championshipName: ChampionshipName
  rankingUrl: string
  nextMatchDayUrl: string
  numberOfTeams: number
}
