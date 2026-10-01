import { Query, Resolver } from '@nestjs/graphql';
import { GetHealthUseCase } from '@modules/health/application/useCases/getHealth.useCase';
import { HealthType } from './dto/health.type';

@Resolver(() => HealthType)
export class HealthResolver {
  constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

  @Query(() => HealthType)
  health(): HealthType {
    return HealthType.fromDomain(this.getHealthUseCase.execute());
  }
}
