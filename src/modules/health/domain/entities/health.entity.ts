export class Health {
  private constructor(
    private readonly status: 'ok',
    private readonly uptime: number,
    private readonly timestamp: string,
  ) {}

  static create(): Health {
    return new Health('ok', process.uptime(), new Date().toISOString());
  }

  getStatus(): 'ok' {
    return this.status;
  }

  getUptime(): number {
    return this.uptime;
  }

  getTimestamp(): string {
    return this.timestamp;
  }
}
