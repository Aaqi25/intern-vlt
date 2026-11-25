import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Restrict CORS to known frontend origins only (P0 security fix)
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development also allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin '${origin}' is not allowed`), false);
    },
    credentials: true,
  });

  // Global validation pipe — strips unknown properties and validates DTO inputs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // Strip unknown fields
    forbidNonWhitelisted: false, // Don't throw on unknown (backward compat)
    transform: true,       // Auto-transform primitives to declared types
  }));

  app.setGlobalPrefix('api');
  await app.listen(3001); // running on 3001 to avoid conflicts with 3000
  console.log(`[NestJS] Assessment API running on port 3001`);
}
bootstrap();

