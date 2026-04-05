import * as joi from 'joi';

export const envValidationSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().default(3000),

  // Production: DATABASE_URL (PostgreSQL on Railway)
  // Development: DB_PATH (SQLite local file)
  DATABASE_URL: joi.string().uri().optional(),
  DB_PATH: joi.string().when('DATABASE_URL', {
    is: joi.exist(),
    then: joi.optional(),
    otherwise: joi.required(),
  }),

  JWT_ACCESS_SECRET: joi.string().required().min(32),
  JWT_REFRESH_SECRET: joi.string().required().min(32),
  JWT_ACCESS_EXPIRES_IN: joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
  CORS_ORIGIN: joi.string().default('http://localhost:4200'),
});
