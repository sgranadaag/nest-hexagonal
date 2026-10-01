import { Module } from '@nestjs/common';
import { HealthController } from './infrastructure/adapters/in/rest/health.controller';
import { HealthResolver } from './infrastructure/adapters/in/graphql/health.resolver';
import { GetHealthUseCase } from './application/useCases/getHealth.useCase';

@Module({
  controllers: [HealthController],
  providers: [GetHealthUseCase, HealthResolver],
})
export class HealthModule {}
