import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, LoggingInterceptor } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Never expose error stack traces
    logger:
      process.env['NODE_ENV'] === 'production'
        ? ['error', 'warn']
        : ['error', 'warn', 'log', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // ──────────────────────────────────────────────
  // 1. HELMET — HTTP security headers
  // ──────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: isProduction ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false, // required for Swagger UI
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ──────────────────────────────────────────────
  // 2. CORS — restrict to known origin only
  // ──────────────────────────────────────────────
  const allowedOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:4200');
  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // preflight cache 24h
  });

  // ──────────────────────────────────────────────
  // 3. VALIDATION — whitelist + transform; block unknown fields
  // ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  // ──────────────────────────────────────────────
  // 4. GLOBAL FILTER & INTERCEPTOR
  // ──────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ──────────────────────────────────────────────
  // 5. SWAGGER — only in non-production
  // ──────────────────────────────────────────────
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Task Manager API')
      .setDescription('RESTful API for Task Manager — dev only')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '127.0.0.1'); // bind to localhost only; use a reverse proxy in prod
  console.log(`API running on http://localhost:${port}`);
  if (!isProduction) {
    console.log(`Swagger: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
