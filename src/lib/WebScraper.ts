import { MatchDay, Ranking } from '@model/types'

export interface WebScraper {
  getRanking(targetUrl: string): Promise<Ranking>
  getMatchDay(targetUrl: string): Promise<MatchDay>
}
