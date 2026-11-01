import { StreamAdapter } from './parserTypes';
import { DirectM3u8Parser } from './directM3u8Parser';
import { DirectMp4Parser } from './directMp4Parser';
import { AuthorizedSourceAdapter } from './authorizedSourceAdapter';
import { PlaySourceInfo } from '@/types/parser';

export class ParserRegistry {
  private adapters: StreamAdapter[] = [];

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.adapters.push(new DirectM3u8Parser());
    this.adapters.push(new DirectMp4Parser());
    this.adapters.push(new AuthorizedSourceAdapter());
  }

  public register(adapter: StreamAdapter): void {
    this.adapters.unshift(adapter); // High priority
  }

  public findAdapter(url: string, sourceCode?: string): StreamAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.canHandle(url, sourceCode)) {
        return adapter;
      }
    }
    return null;
  }

  public getSupportedSources(): PlaySourceInfo[] {
    return [
      {
        code: 'kkm3u8',
        name: '快看 HLS 极速蓝光',
        enabled: true,
        type: 'direct_m3u8',
        description: '支持分片 HLS M3U8 直连，抗弱网抖动，自适应码率',
        priority: 10,
      },
      {
        code: 'ffm3u8',
        name: '非凡 HLS 超清',
        enabled: true,
        type: 'direct_m3u8',
        description: '标准 HLS 格式，画质饱满，支持多音轨及字幕',
        priority: 9,
      },
      {
        code: 'lzm3u8',
        name: '量子 HLS 极速',
        enabled: true,
        type: 'direct_m3u8',
        description: '超低首屏延迟，支持点播与分片并发预加载',
        priority: 8,
      },
      {
        code: 'hnm3u8',
        name: '红牛资源 HLS',
        enabled: true,
        type: 'direct_m3u8',
        description: '多剧集同步线路，稳定备用源',
        priority: 7,
      },
      {
        code: 'm3u8',
        name: '原生 M3U8 直播/点播',
        enabled: true,
        type: 'direct_m3u8',
        description: '通用 RFC 8216 HLS 标准协议流',
        priority: 6,
      },
      {
        code: 'mp4',
        name: 'MP4 高清原画直链',
        enabled: true,
        type: 'direct_mp4',
        description: '支持 HTTP Range 分段缓存拖拽播放，兼容所有移动端',
        priority: 5,
      },
      {
        code: 'authorized_cdn',
        name: '自建与授权专线 CDN',
        enabled: true,
        type: 'authorized_cdn',
        description: '经过企业级域名与授权密钥校验的官方流媒体源',
        priority: 4,
      },
    ];
  }
}

export const globalParserRegistry = new ParserRegistry();
