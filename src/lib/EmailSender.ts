export interface EmailSender<ContentType> {
  sendEmail(
    targetEmails: string[],
    content: ContentType,
    subject?: string,
  ): Promise<boolean>
}
