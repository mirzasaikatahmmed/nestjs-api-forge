import { Module } from '@nestjs/common';
import { ApiForgeModule } from 'nestjs-api-forge';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // Register ApiForgeModule globally — wraps every response and handles all exceptions
    ApiForgeModule.forRoot({
      version: '1.0.0',
      defaultSuccessMessage: 'Request successful',
      includePath: true,
      includeTimestamp: true,
    }),
    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}
