export const ACCESS_TOKEN_EXPIRES =
  Number(process.env.ACCESS_TOKEN_EXPIRES) || 15 * 60;

export const REFRESH_TOKEN_EXPIRES =
  Number(process.env.REFRESH_TOKEN_EXPIRES) || 180 * 24 * 60 * 60;
