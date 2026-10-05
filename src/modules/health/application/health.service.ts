import { Injectable } from '@nestjs/common';
import { Health } from '@modules/health/domain/health.entity';

@Injectable()
export class HealthService {
  get(): Health {
    return Health.create();
  }
}
