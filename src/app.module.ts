import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig } from '@config/postgres.config';
import { HealthModule } from './modules/health/health.module';
import { LibraryModule } from './modules/library/library.module';
import { AuthorModule } from './modules/author/author.module';
import { BookModule } from './modules/book/book.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: postgresConfig,
    }),
    HealthModule,
    LibraryModule,
    AuthorModule,
    BookModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
