import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('nestjs-api-forge Demo')
    .setDescription(
      'Demonstrates standardized API responses, exception handling, and pagination provided by **nestjs-api-forge**.',
    )
    .setVersion('1.0.0')
    .addTag('users', 'User management — full CRUD')
    .addTag('products', 'Product catalogue — CRUD with per-controller @ApiForge()')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(3000);
  console.log('Demo app  → http://localhost:3000');
  console.log('Swagger   → http://localhost:3000/docs');
}

bootstrap();
