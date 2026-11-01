interface RateRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private records = new Map<string, RateRecord>();
  private defaultLimit: number = 60; // 60 requests
  private defaultWindowMs: number = 60 * 1000; // 1 minute

  public check(ip: string, limit: number = this.defaultLimit, windowMs: number = this.defaultWindowMs): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    let record = this.records.get(ip);

    if (!record || now > record.resetAt) {
      record = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.records.set(ip, record);
      return {
        allowed: true,
        remaining: limit - 1,
        resetInSeconds: Math.ceil(windowMs / 1000),
      };
    }

    record.count++;
    if (record.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - record.count),
      resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  public cleanup() {
    const now = Date.now();
    for (const [ip, rec] of this.records.entries()) {
      if (now > rec.resetAt) {
        this.records.delete(ip);
      }
    }
  }
}

export const globalRateLimiter = new RateLimiter();
