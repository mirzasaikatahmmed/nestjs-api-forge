import { Module } from '@nestjs/common';
import { ApiForgeModule } from 'nestjs-api-forge';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ApiForgeModule.forRoot({
      version: '1.0.0',
      defaultSuccessMessage: 'Request successful',
      includePath: true,
      includeTimestamp: true,
      includeRequestId: true,
      includeResponseTime: true,
      correlationIdHeader: 'x-request-id',
    }),
    UsersModule,
    ProductsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
