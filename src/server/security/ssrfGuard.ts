import { URL } from 'url';

// Default trusted streaming CDNs and content domains for testing and production
const DEFAULT_ALLOWED_HOST_PATTERNS = [
  'localhost',
  '127.0.0.1',
  'commondatastorage.googleapis.com',
  'storage.googleapis.com',
  'test-streams.mux.dev',
  'vjs.zencdn.net',
  'dash.akamaized.net',
  'bitmovin-a.akamaihd.net',
  'demo.unified-streaming.com',
  'assets.afcdn.com',
  '*.m3u8.tv',
  '*.cdn.bcebos.com',
  '*.myqcloud.com',
  '*.aliyuncs.com',
  '*.cloudfront.net',
  '*.akamaized.net',
  '*.fastly.net',
];

export class SsrfGuard {
  private allowedPatterns: Set<string> = new Set();
  private blockPrivateNetworks: boolean = true;

  constructor() {
    this.initPatterns();
  }

  private initPatterns() {
    // Load from env
    const envHosts = process.env.ALLOWED_PLAYBACK_HOSTS;
    if (envHosts) {
      envHosts.split(',').map(h => h.trim()).filter(Boolean).forEach(h => this.allowedPatterns.add(h));
    }
    // Add default patterns
    DEFAULT_ALLOWED_HOST_PATTERNS.forEach(p => this.allowedPatterns.add(p));
  }

  public getAllowedHosts(): string[] {
    return Array.from(this.allowedPatterns);
  }

  public addAllowedHost(host: string): void {
    if (host && host.trim()) {
      this.allowedPatterns.add(host.trim().toLowerCase());
    }
  }

  public removeAllowedHost(host: string): void {
    this.allowedPatterns.delete(host.trim().toLowerCase());
  }

  public isIpPrivateOrInternal(hostname: string): boolean {
    const clean = hostname.replace(/[\[\]]/g, '').trim().toLowerCase();

    // Localhost / Loopback
    if (clean === 'localhost' || clean === '127.0.0.1' || clean === '::1') {
      // In local development or testing, localhost may be allowed if explicitly permitted
      return false; // let host pattern matcher decide
    }

    // IPv4 private ranges check
    const ipv4Match = clean.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octet1 = parseInt(ipv4Match[1], 10);
      const octet2 = parseInt(ipv4Match[2], 10);

      // 0.0.0.0/8
      if (octet1 === 0) return true;
      // 10.0.0.0/8
      if (octet1 === 10) return true;
      // 127.0.0.0/8
      if (octet1 === 127) return true;
      // 169.254.0.0/16 (Link Local / Cloud Metadata)
      if (octet1 === 169 && octet2 === 254) return true;
      // 172.16.0.0/12
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
      // 192.168.0.0/16
      if (octet1 === 192 && octet2 === 168) return true;
      // 100.64.0.0/10 (Carrier-grade NAT)
      if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;
    }

    // IPv6 private or metadata
    if (clean.startsWith('fc00:') || clean.startsWith('fd00:') || clean.startsWith('fe80:')) {
      return true;
    }

    return false;
  }

  public validateUrl(rawUrl: string): { valid: boolean; reason?: string; safeUrl?: string } {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { valid: false, reason: 'URL 不能为空' };
    }

    const trimmed = rawUrl.trim();

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return { valid: false, reason: '无效的 URL 格式' };
    }

    // Only HTTP / HTTPS permitted
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: `禁止使用不安全协议: ${parsed.protocol}` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check SSRF private IP
    if (this.blockPrivateNetworks && this.isIpPrivateOrInternal(hostname)) {
      return { valid: false, reason: '禁止访问内网或保留 IP 地址 (SSRF 防护)' };
    }

    // Check Cloud Metadata (AWS, GCP, Azure, Alibaba)
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal' || hostname === 'instance-data') {
      return { valid: false, reason: '禁止请求云服务元数据端点' };
    }

    // Check against allowed host patterns
    const isAllowed = this.isHostAllowed(hostname);
    if (!isAllowed) {
      return { 
        valid: false, 
        reason: `播放源域名 [${hostname}] 未在白名单中，已被安全拦截` 
      };
    }

    return { valid: true, safeUrl: parsed.toString() };
  }

  public isHostAllowed(hostname: string): boolean {
    const cleanHost = hostname.toLowerCase();

    // If wildcard '*' is in list
    if (this.allowedPatterns.has('*')) return true;

    for (const pattern of this.allowedPatterns) {
      const cleanPattern = pattern.toLowerCase();
      if (cleanPattern === cleanHost) {
        return true;
      }
      if (cleanPattern.startsWith('*.')) {
        const rootDomain = cleanPattern.slice(2);
        if (cleanHost === rootDomain || cleanHost.endsWith('.' + rootDomain)) {
          return true;
        }
      }
    }
    return false;
  }
}

export const globalSsrfGuard = new SsrfGuard();
