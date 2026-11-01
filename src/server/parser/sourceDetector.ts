import { StreamType } from '@/types/parser';
import { CleanStreamEngine } from '@/server/filter/cleanStreamEngine';

export interface DetectionResult {
  type: StreamType;
  isClean: boolean;
  score: number;
  qualityTag: string;
  detectedFormat: string;
  isAdPage: boolean;
  reason?: string;
}

export class SourceDetector {
  /**
   * 自动探测与识别播放流类型及纯净度评分
   */
  public static detect(url: string, sourceCode?: string): DetectionResult {
    if (!url || typeof url !== 'string') {
      return {
        type: 'unknown',
        isClean: false,
        score: 0,
        qualityTag: '无效地址',
        detectedFormat: 'unknown',
        isAdPage: false,
        reason: '播放地址为空',
      };
    }

    const clean = url.trim();
    const lower = clean.toLowerCase();

    // 1. 检查是否为第三方广告解析网页
    const isAdPage = CleanStreamEngine.isSuspiciousAdUrl(clean);
    if (isAdPage) {
      return {
        type: 'unknown',
        isClean: false,
        score: 10,
        qualityTag: '广告嫌疑',
        detectedFormat: 'ad_webpage',
        isAdPage: true,
        reason: '匹配到第三方广告解析网页特征',
      };
    }

    // 2. 检测 HLS / M3U8
    if (lower.includes('.m3u8') || lower.includes('/m3u8') || (sourceCode && sourceCode.toLowerCase().includes('m3u8'))) {
      const quality = CleanStreamEngine.scoreSourceQuality(sourceCode || 'HLS', clean);
      return {
        type: 'hls',
        isClean: quality.isClean,
        score: quality.score,
        qualityTag: quality.recommendedTag,
        detectedFormat: 'application/vnd.apple.mpegurl (HLS)',
        isAdPage: false,
      };
    }

    // 3. 检测 MP4 直链
    if (lower.includes('.mp4') || lower.includes('/mp4') || lower.includes('.mkv')) {
      const quality = CleanStreamEngine.scoreSourceQuality(sourceCode || 'MP4', clean);
      return {
        type: 'mp4',
        isClean: quality.isClean,
        score: quality.score,
        qualityTag: quality.recommendedTag,
        detectedFormat: 'video/mp4',
        isAdPage: false,
      };
    }

    return {
      type: 'unknown',
      isClean: false,
      score: 30,
      qualityTag: '未知格式',
      detectedFormat: 'unknown_stream',
      isAdPage: false,
      reason: '未能匹配到标准流媒体特征',
    };
  }
}
