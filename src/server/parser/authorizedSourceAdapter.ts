import { StreamAdapter } from './parserTypes';
import { StreamType } from '@/types/parser';

export class AuthorizedSourceAdapter implements StreamAdapter {
  id = 'authorized_source';
  name = '已授权流媒体 CDN 适配器';

  canHandle(url: string, sourceCode?: string): boolean {
    if (!url) return false;
    const lowerCode = (sourceCode || '').toLowerCase();
    return (
      lowerCode.includes('cdn') ||
      lowerCode.includes('authorized') ||
      lowerCode.includes('cloud') ||
      url.includes('cdn') ||
      url.includes('storage') ||
      url.includes('bcebos') ||
      url.includes('aliyuncs') ||
      url.includes('myqcloud')
    );
  }

  async parse(url: string): Promise<{
    type: StreamType;
    cleanUrl: string;
    headers?: Record<string, string>;
    expireAt?: number | null;
  }> {
    const cleanUrl = url.trim();
    const isHls = cleanUrl.includes('.m3u8') || cleanUrl.includes('m3u8');

    return {
      type: isHls ? 'hls' : 'mp4',
      cleanUrl,
      headers: {
        'Origin': 'https://applet.local',
        'User-Agent': 'Apple-Movie-Player/1.0',
      },
      expireAt: Date.now() + 3600 * 1000 * 6, // 6 hours validity
    };
  }
}
