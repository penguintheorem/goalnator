export interface EmailTemplateBuilder<DynamicContentType> {
  build: (content: DynamicContentType[]) => string
}
