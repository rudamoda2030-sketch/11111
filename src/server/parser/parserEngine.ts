import { globalParserRegistry } from './parserRegistry';
import { globalSsrfGuard } from '../security/ssrfGuard';
import { ParseResult } from '@/types/parser';

export class ParserEngine {
  /**
   * Parses and validates a stream URL according to safety and stream standards
   */
  public async parseStream(
    url: string, 
    sourceCode?: string, 
    title?: string
  ): Promise<ParseResult> {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return {
        valid: false,
        type: 'unknown',
        cleanUrl: '',
        error: '播放地址为空',
        status: 'invalid',
      };
    }

    const trimmed = url.trim();

    // 1. SSRF & Protocol Safety Check
    const ssrfCheck = globalSsrfGuard.validateUrl(trimmed);
    if (!ssrfCheck.valid) {
      return {
        valid: false,
        type: 'unknown',
        cleanUrl: trimmed,
        error: ssrfCheck.reason || '播放地址未通过安全白名单校验或触发 SSRF 拦截',
        status: 'ssrf_blocked',
      };
    }

    // 2. Select appropriate adapter
    const adapter = globalParserRegistry.findAdapter(ssrfCheck.safeUrl!, sourceCode);
    if (!adapter) {
      // If no specialized adapter matches, check if it's general web link
      const lower = ssrfCheck.safeUrl!.toLowerCase();
      if (lower.endsWith('.m3u8') || lower.includes('.m3u8?') || lower.includes('m3u8')) {
        return {
          valid: true,
          type: 'hls',
          cleanUrl: ssrfCheck.safeUrl!,
          headers: {},
          status: 'active',
        };
      } else if (lower.endsWith('.mp4') || lower.includes('.mp4?')) {
        return {
          valid: true,
          type: 'mp4',
          cleanUrl: ssrfCheck.safeUrl!,
          headers: {},
          status: 'active',
        };
      }

      return {
        valid: false,
        type: 'unknown',
        cleanUrl: ssrfCheck.safeUrl!,
        error: '不支持的播放流媒体格式或非受信协议',
        status: 'invalid',
      };
    }

    try {
      const parsedData = await adapter.parse(ssrfCheck.safeUrl!, { sourceCode, title });
      return {
        valid: true,
        type: parsedData.type,
        cleanUrl: parsedData.cleanUrl,
        headers: parsedData.headers,
        status: 'active',
      };
    } catch (err: any) {
      return {
        valid: false,
        type: 'unknown',
        cleanUrl: ssrfCheck.safeUrl!,
        error: `解析流媒体失败: ${err.message}`,
        status: 'invalid',
      };
    }
  }
}

export const globalParserEngine = new ParserEngine();
