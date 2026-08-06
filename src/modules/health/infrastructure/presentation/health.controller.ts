import { Controller, Get } from '@nestjs/common';
import { GetHealthUseCase } from '@modules/health/application/useCases/getHealth.useCase';
import { HealthResponseDto } from './dto/healthResponse.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

  @Get()
  getHealth(): HealthResponseDto {
    return HealthResponseDto.fromDomain(this.getHealthUseCase.execute());
  }
}
