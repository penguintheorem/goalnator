import { Ranking, MatchDay, MatchResult } from '@model/types'
import { WebScraper } from './WebScraper'
import puppeteer, { Browser, Page } from 'puppeteer-core'
import Chromium from '@sparticuz/chromium-min'

// Approach seen here https://www.stefanjudis.com/blog/how-to-use-headless-chrome-in-serverless-functions/
// Not sure if it would work also in Lambdas, maybe I can store it in my own S3 bucket
const CDN_CHROMIUM_DOWNLOAD_URL = `https://github.com/Sparticuz/chromium/releases/download/v122.0.0/chromium-v122.0.0-pack.tar`

const attachLogger = (page: Page) => {
  page.on('console', (message) => console.log('[BROWSER]:', message.text()))
}

export class WebScraperPuppeteer implements WebScraper {
  private browser: Browser | null = null

  private async getBrowserInstance() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        executablePath: await Chromium.executablePath(
          CDN_CHROMIUM_DOWNLOAD_URL,
        ),
        headless: true,
        ignoreHTTPSErrors: true,
        defaultViewport: Chromium.defaultViewport,
        args: [...Chromium.args, '--hide-scrollbars', '--disable-web-security'],
      })
    }
    return this.browser
  }

  async getRanking(targetUrl: string): Promise<Ranking> {
    const browser = await this.getBrowserInstance()
    const page = await browser.newPage()
    // TODO: Optionally enable this
    // attachLogger(page)

    console.log(`getRanking - Navigating to ${targetUrl}`)
    await page.goto(targetUrl, {
      timeout: 0,
    })
    await page.waitForSelector('.ui-table__row')

    return page.evaluate(() => {
      // TODO: this looks quite legacy, consider refactoring
      const getMatchResultByLabel = (label: string): MatchResult => {
        if (!label) {
          throw new Error('getMatchResultByLabel - label is empty')
        }

        switch (label) {
          case 'V':
            return MatchResult.WIN
          case 'P':
            return MatchResult.LOSS
          default:
            return MatchResult.DRAW
        }
      }

      const extractInnerHTMLSafe = (
        selector: string,
        context: Document | Element,
      ) => {
        const element = context.querySelector(selector)

        return element ? element.innerHTML : ''
      }

      const extractRanking = (document: Document) => {
        const list = document.querySelectorAll('.ui-table__row')
        const ranking: Ranking = []

        list.forEach((item, index) => {
          const teamName = extractInnerHTMLSafe(
            '.tableCellParticipant__name',
            item,
          )
          if (!teamName) {
            // TODO: replace with a good logger
            console.error('extractRanking - Team name not found, skip team')
            return
          }

          const teamPosition = index + 1
          const lastMatchesWrapperDOMElement =
            item.querySelector('.table__cell--form')

          if (!lastMatchesWrapperDOMElement) {
            return
          }

          const lastMatchesTags =
            lastMatchesWrapperDOMElement.querySelectorAll('span')
          const lastMatches: MatchResult[] = []

          lastMatchesTags.forEach((lastMatch, index) => {
            if (index > 0) {
              lastMatches.push(getMatchResultByLabel(lastMatch.innerHTML))
            }
          })

          ranking.push({
            teamName,
            position: teamPosition,
            lastMatchResults: lastMatches,
          })
        })

        return ranking
      }

      return extractRanking(document)
    })
  }

  async getMatchDay(targetUrl: string): Promise<MatchDay> {
    const browser = await this.getBrowserInstance()
    const page = await browser.newPage()

    console.log(`getMatchDay - Navigating to ${targetUrl}`)
    await page.goto(targetUrl, {
      timeout: 0,
    })

    const rootCalendarSelector =
      '.event__match.event__match--static.event__match--scheduled'
    await page.waitForSelector(rootCalendarSelector)

    return page.evaluate(() => {
      const extractInnerHTMLSafe = (
        selector: string,
        context: Document | Element,
      ) => {
        const element = context.querySelector(selector)

        return element ? element.innerHTML : ''
      }

      const extractCalendar = (document: Document) => {
        const tags = document.querySelectorAll(
          '.event__match.event__match--static.event__match--scheduled',
        )
        const matchDay: MatchDay = []
        tags.forEach((item, index) => {
          matchDay.push({
            homeTeam: extractInnerHTMLSafe('.event__participant--home', item),
            awayTeam: extractInnerHTMLSafe('.event__participant--away', item),
            matchTime: extractInnerHTMLSafe('.event__time', item),
          })
        })

        return matchDay.slice(0, 10)
      }

      return extractCalendar(document)
    })
  }
}
