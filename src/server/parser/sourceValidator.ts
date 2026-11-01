import { validatePlaybackUrl, ParserError } from './maccms-parser';
import { globalSsrfGuard } from '@/server/security/ssrfGuard';
import { StreamType } from '@/types/parser';

export interface ValidatedStream {
  url: string;
  type: StreamType;
  hostname: string;
  isHttps: boolean;
}

export class SourceValidator {
  /**
   * 严格验证播放地址安全、协议和白名单
   */
  public static validate(rawUrl: string): ValidatedStream {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new ParserError('播放地址不能为空', 400);
    }

    // 1. SSRF Guard 过滤私有 IP 及云元数据
    const ssrfCheck = globalSsrfGuard.validateUrl(rawUrl);
    if (!ssrfCheck.valid) {
      throw new ParserError(ssrfCheck.reason || '播放地址被安全防护拦截 (SSRF)', 403);
    }

    // 2. 核心流媒体格式与域名白名单验证
    const validated = validatePlaybackUrl(ssrfCheck.safeUrl!);

    const parsed = new URL(validated.url);

    return {
      url: validated.url,
      type: validated.type,
      hostname: parsed.hostname,
      isHttps: parsed.protocol === 'https:',
    };
  }
}
