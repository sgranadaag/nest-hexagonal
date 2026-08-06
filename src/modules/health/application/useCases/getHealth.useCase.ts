import { Injectable } from '@nestjs/common';
import { Health } from '@modules/health/domain/entities/health.entity';

@Injectable()
export class GetHealthUseCase {
  execute(): Health {
    return Health.create();
  }
}
