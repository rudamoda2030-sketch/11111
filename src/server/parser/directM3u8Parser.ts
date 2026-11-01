import { StreamAdapter } from './parserTypes';
import { StreamType } from '@/types/parser';

export class DirectM3u8Parser implements StreamAdapter {
  id = 'direct_m3u8';
  name = '标准 HLS/M3U8 解析器';

  canHandle(url: string, sourceCode?: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    const isM3u8Ext = lower.includes('.m3u8') || lower.includes('/m3u8');
    const isM3u8Code = sourceCode ? sourceCode.toLowerCase().includes('m3u8') : false;
    return isM3u8Ext || isM3u8Code;
  }

  async parse(url: string): Promise<{
    type: StreamType;
    cleanUrl: string;
    headers?: Record<string, string>;
    expireAt?: number | null;
  }> {
    // Clean whitespace and any trailing illegal characters
    const cleanUrl = url.trim();

    return {
      type: 'hls',
      cleanUrl,
      headers: {
        'Accept': '*/*',
      },
      expireAt: null,
    };
  }
}
