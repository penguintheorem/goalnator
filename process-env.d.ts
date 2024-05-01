declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
    LAMBDA_TASK_ROOT: string
    AWS_SAM_LOCAL: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_REGION: string
    SENDER_EMAIL: string
    TARGET_EMAILS_JSON: string
  }
}
