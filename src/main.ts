import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ENV } from '@constants/environment.constant';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './middlewares/httpException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);
  await app.listen(configService.get(ENV.PORT) ?? 3000);
}
void bootstrap();
