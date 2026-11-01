import { PlaySource } from '@/types/maccms';
import { CleanStreamEngine } from '@/server/filter/cleanStreamEngine';

export interface RankedSource {
  sourceIndex: number;
  sourceCode: string;
  sourceName: string;
  qualityTag: string;
  score: number;
  isRecommended: boolean;
  episodeCount: number;
}

export class FallbackManager {
  /**
   * 对影片的全部可用线路进行智能评分和排序，将最高清、无广告、纯净的线路排在前面
   */
  public static rankSources(sources: PlaySource[]): RankedSource[] {
    if (!sources || sources.length === 0) return [];

    const ranked: RankedSource[] = sources.map((s, idx) => {
      const sampleUrl = s.episodes?.[0]?.rawUrl || s.episodes?.[0]?.url || '';
      const sourceTitle = s.sourceName || s.name || `线路 ${idx + 1}`;
      const quality = CleanStreamEngine.scoreSourceQuality(sourceTitle, sampleUrl);

      return {
        sourceIndex: idx,
        sourceCode: (s as any).sourceCode || `source_${idx + 1}`,
        sourceName: sourceTitle,
        qualityTag: quality.recommendedTag,
        score: quality.score,
        isRecommended: false,
        episodeCount: s.episodes?.length || 0,
      };
    });

    // 按评分从高到低排序，最高分设为推荐
    ranked.sort((a, b) => b.score - a.score);
    if (ranked.length > 0) {
      ranked[0].isRecommended = true;
    }

    return ranked;
  }

  /**
   * 当主线路播放失败时，获取下一个推荐备用线路
   */
  public static getNextFallback(
    sources: PlaySource[],
    currentSourceIndex: number
  ): RankedSource | null {
    const ranked = this.rankSources(sources);
    const candidate = ranked.find((s) => s.sourceIndex !== currentSourceIndex);
    return candidate || null;
  }
}
