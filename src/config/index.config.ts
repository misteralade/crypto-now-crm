export const ENVIRONMENTS = { DEVELOPMENT: "development", PRODUCTION: "production" } as const;

export const BASIC = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  API_BASE_URL: import.meta.env.VITE_BASE_URL || "",
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  NODE_ENV: import.meta.env.VITE_NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
  PORT: import.meta.env.VITE_PORT || 5173,
}