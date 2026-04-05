import * as joi from 'joi';

export const envValidationSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().default(3000),
  DB_PATH: joi.string().required(),
  JWT_ACCESS_SECRET: joi.string().required().min(32),
  JWT_REFRESH_SECRET: joi.string().required().min(32),
  JWT_ACCESS_EXPIRES_IN: joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
  CORS_ORIGIN: joi.string().default('http://localhost:4200'),
});
