export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  clientIp: string;
  endpoint: string;
  movieId?: string | number;
  sourceIndex?: number;
  episodeIndex?: number;
  status: 'success' | 'failed' | 'blocked' | 'rate_limited';
  durationMs: number;
  message?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 200;
  private totalRequests: number = 0;
  private totalResolves: number = 0;
  private successfulResolves: number = 0;
  private failedResolves: number = 0;
  private blockedSsrfCount: number = 0;
  private totalDurationMs: number = 0;

  public log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logItem: AuditLogEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      // Ensure any potential tokens or passwords in messages are masked
      message: this.maskSensitive(entry.message || ''),
    };

    this.logs.unshift(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.totalRequests++;
    this.totalDurationMs += entry.durationMs;

    if (entry.action === 'resolve_play') {
      this.totalResolves++;
      if (entry.status === 'success') {
        this.successfulResolves++;
      } else {
        this.failedResolves++;
      }
    }

    if (entry.status === 'blocked') {
      this.blockedSsrfCount++;
    }
  }

  public getRecentLogs(limit: number = 50): AuditLogEntry[] {
    return this.logs.slice(0, limit);
  }

  public getMetrics() {
    const successRate = this.totalResolves > 0
      ? ((this.successfulResolves / this.totalResolves) * 100).toFixed(1) + '%'
      : '100.0%';

    const avgLatencyMs = this.totalRequests > 0
      ? Math.round(this.totalDurationMs / this.totalRequests)
      : 0;

    return {
      totalRequests: this.totalRequests,
      totalResolves: this.totalResolves,
      successfulResolves: this.successfulResolves,
      failedResolves: this.failedResolves,
      blockedSsrfCount: this.blockedSsrfCount,
      successRate,
      avgLatencyMs,
    };
  }

  private maskSensitive(text: string): string {
    if (!text) return '';
    return text
      .replace(/(token|secret|password|api_key|key)=([^&\s]+)/gi, '$1=***')
      .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer ***');
  }
}

export const globalAuditLogger = new AuditLogger();
