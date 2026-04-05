import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { User, Task } from './entities';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { TasksModule } from './tasks';
import { StatsModule } from './stats';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),

    // ── Rate limiting (global default: 100 req / 60s per IP) ──────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => [
        {
          name: 'default',
          ttl: 60_000, // 60 seconds window
          limit: 100, // max 100 requests per window
        },
        {
          name: 'auth',
          ttl: 60_000, // 60 seconds window
          limit: 10, // max 10 auth attempts per window (applied per-endpoint)
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            entities: [User, Task],
            synchronize: false,
            logging: !isProduction,
            ssl: { rejectUnauthorized: false },
          };
        }

        return {
          type: 'better-sqlite3' as const,
          database: configService.get<string>('DB_PATH', './tasks.db'),
          entities: [User, Task],
          synchronize: false,
          logging: !isProduction,
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    TasksModule,
    StatsModule,
  ],
  providers: [
    // Apply default throttle to every route globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
