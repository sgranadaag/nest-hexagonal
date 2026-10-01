import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Health } from '@modules/health/domain/entities/health.entity';

@ObjectType('Health')
export class HealthType {
  @Field()
  readonly status: string;

  @Field(() => Float)
  readonly uptime: number;

  @Field()
  readonly timestamp: string;

  private constructor(status: string, uptime: number, timestamp: string) {
    this.status = status;
    this.uptime = uptime;
    this.timestamp = timestamp;
  }

  static fromDomain(health: Health): HealthType {
    return new HealthType(
      health.getStatus(),
      health.getUptime(),
      health.getTimestamp(),
    );
  }
}
