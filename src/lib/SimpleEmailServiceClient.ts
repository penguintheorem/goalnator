import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import AWS from 'aws-sdk'
import { EmailSender } from './EmailSender'

export class SimpleEmailServiceClient implements EmailSender<string> {
  private readonly client: SESClient

  constructor(
    private readonly awsRegion: string,
    private readonly sourceEmailAddress: string,
  ) {
    if (process.env.AWS_SAM_LOCAL) {
      console.debug(`SimpleEmailServiceClient - Running the lambda locally`)
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      })
    }

    this.client = new SESClient({ region: this.awsRegion })
  }

  private getSendEmailCommand(
    targetEmails: string[],
    content: string,
    subject = '',
  ): SendEmailCommand {
    return new SendEmailCommand({
      Destination: {
        ToAddresses: targetEmails,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: content,
          },
        },

        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: this.sourceEmailAddress,
    })
  }

  async sendEmail(
    targetEmails: string[],
    content: string,
    subject?: string,
  ): Promise<boolean> {
    const command = this.getSendEmailCommand(targetEmails, content, subject)

    try {
      const response = await this.client.send(command)
      // TODO: logger
      console.log(response)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}
