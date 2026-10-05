import { Controller, Get } from '@nestjs/common';
import { HealthService } from '@modules/health/application/health.service';
import { HealthResponseDto } from './dto/healthResponse.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth(): HealthResponseDto {
    return HealthResponseDto.fromDomain(this.healthService.get());
  }
}
