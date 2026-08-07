import { Module } from '@nestjs/common';
import { HealthController } from './infrastructure/adapters/in/rest/health.controller';
import { GetHealthUseCase } from './application/useCases/getHealth.useCase';

@Module({
  controllers: [HealthController],
  providers: [GetHealthUseCase],
})
export class HealthModule {}
