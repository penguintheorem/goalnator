type WebScrapingConfig = {
  countryCode: string
  championshipName: string
  rankingUrl: string
  nextMatchDayUrl: string
  numberOfTeams: number
}

export type WebScrapingConfigs = WebScrapingConfig[]
