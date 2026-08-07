import { Health } from '@modules/health/domain/entities/health.entity';

export class HealthResponseDto {
  private constructor(
    public readonly status: string,
    public readonly uptime: number,
    public readonly timestamp: string,
  ) {}

  static fromDomain(health: Health): HealthResponseDto {
    return new HealthResponseDto(
      health.getStatus(),
      health.getUptime(),
      health.getTimestamp(),
    );
  }
}
