import { StreamAdapter } from './parserTypes';
import { StreamType } from '@/types/parser';

export class DirectMp4Parser implements StreamAdapter {
  id = 'direct_mp4';
  name = '标准 MP4 直链解析器';

  canHandle(url: string, sourceCode?: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    const isMp4Ext = lower.includes('.mp4') || lower.includes('/mp4') || lower.includes('.mkv');
    const isMp4Code = sourceCode ? sourceCode.toLowerCase().includes('mp4') : false;
    return isMp4Ext || isMp4Code;
  }

  async parse(url: string): Promise<{
    type: StreamType;
    cleanUrl: string;
    headers?: Record<string, string>;
    expireAt?: number | null;
  }> {
    const cleanUrl = url.trim();

    return {
      type: 'mp4',
      cleanUrl,
      headers: {
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
      },
      expireAt: null,
    };
  }
}
