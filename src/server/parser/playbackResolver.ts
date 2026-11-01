import { ResolveRequest, PlaybackData, ApiResponse } from '@/types/parser';
import { globalMacCmsClient } from '../maccms/macCmsClient';
import { globalParserEngine } from './parserEngine';
import { globalAuditLogger } from '../security/auditLogger';

export class PlaybackResolver {
  /**
   * Resolves a video playback request securely by reading verified MacCMS data
   * and generating ad-free, pure stream URLs
   */
  public async resolve(
    req: ResolveRequest, 
    clientIp: string = '127.0.0.1'
  ): Promise<ApiResponse<PlaybackData>> {
    const startTime = Date.now();
    const { movieId, sourceIndex = 0, episodeIndex = 0 } = req;

    if (!movieId) {
      globalAuditLogger.log({
        action: 'resolve_play',
        clientIp,
        endpoint: '/api/v1/play/resolve',
        status: 'failed',
        durationMs: Date.now() - startTime,
        message: '缺少必须的影片 ID (movieId)',
      });

      return {
        code: 400,
        success: false,
        message: '缺少必须的影片 ID (movieId)',
        error: 'MISSING_MOVIE_ID',
      };
    }

    // 1. Fetch movie detail from MacCMS (or cached item)
    const movie = await globalMacCmsClient.getMovieById(movieId);
    if (!movie) {
      globalAuditLogger.log({
        action: 'resolve_play',
        clientIp,
        endpoint: '/api/v1/play/resolve',
        movieId,
        status: 'failed',
        durationMs: Date.now() - startTime,
        message: `影片不存在或已被下架 (id: ${movieId})`,
      });

      return {
        code: 404,
        success: false,
        message: '影片不存在或已被下架',
        error: 'MOVIE_NOT_FOUND',
      };
    }

    if (!movie.sources || movie.sources.length === 0) {
      globalAuditLogger.log({
        action: 'resolve_play',
        clientIp,
        endpoint: '/api/v1/play/resolve',
        movieId,
        status: 'failed',
        durationMs: Date.now() - startTime,
        message: `影片没有任何有效播放线路 (id: ${movieId})`,
      });

      return {
        code: 404,
        success: false,
        message: '该影片暂无可用播放线路',
        error: 'NO_SOURCES_AVAILABLE',
      };
    }

    // 2. Locate source group
    let activeSource = movie.sources[sourceIndex];
    let actualSourceIndex = sourceIndex;

    if (!activeSource) {
      // Fallback to first available source if requested index out of range
      actualSourceIndex = 0;
      activeSource = movie.sources[0];
    }

    // 3. Locate episode
    if (!activeSource.episodes || activeSource.episodes.length === 0) {
      return {
        code: 404,
        success: false,
        message: `所选播放源 [${activeSource.sourceName}] 下没有可用集数`,
        error: 'NO_EPISODES_IN_SOURCE',
      };
    }

    let activeEpisode = activeSource.episodes[episodeIndex];
    let actualEpisodeIndex = episodeIndex;

    if (!activeEpisode) {
      // Fallback to first episode
      actualEpisodeIndex = 0;
      activeEpisode = activeSource.episodes[0];
    }

    // 4. Send through parsing engine for verification and ad stripping
    const parseResult = await globalParserEngine.parseStream(
      activeEpisode.rawUrl,
      activeSource.sourceCode,
      `${movie.title} - ${activeEpisode.name}`
    );

    const durationMs = Date.now() - startTime;

    if (!parseResult.valid) {
      globalAuditLogger.log({
        action: 'resolve_play',
        clientIp,
        endpoint: '/api/v1/play/resolve',
        movieId,
        sourceIndex: actualSourceIndex,
        episodeIndex: actualEpisodeIndex,
        status: parseResult.status === 'ssrf_blocked' ? 'blocked' : 'failed',
        durationMs,
        message: parseResult.error || '解析播放地址失败',
      });

      // Check if other sources are available to fallback
      const otherSources = movie.sources
        .filter((_, idx) => idx !== actualSourceIndex)
        .map((s, idx) => ({ sourceIndex: idx, sourceName: s.sourceName }));

      return {
        code: parseResult.status === 'ssrf_blocked' ? 403 : 502,
        success: false,
        message: parseResult.error || '视频解析失败，请尝试切换备用线路',
        error: parseResult.status === 'ssrf_blocked' ? 'SECURITY_SSRF_BLOCKED' : 'PARSER_FAILED',
        data: {
          movieId,
          movieTitle: movie.title,
          source: activeSource.sourceName,
          sourceIndex: actualSourceIndex,
          episode: activeEpisode.name,
          episodeIndex: actualEpisodeIndex,
          type: 'unknown',
          url: '',
          headers: {},
          expireAt: null,
          fallbackAvailable: otherSources.length > 0,
          alternativeSources: otherSources,
        },
      };
    }

    // 5. Success: return clean, authorized playback payload
    const alternativeSources = movie.sources
      .filter((_, idx) => idx !== actualSourceIndex)
      .map(s => ({ sourceIndex: s.sourceIndex, sourceName: s.sourceName }));

    globalAuditLogger.log({
      action: 'resolve_play',
      clientIp,
      endpoint: '/api/v1/play/resolve',
      movieId,
      sourceIndex: actualSourceIndex,
      episodeIndex: actualEpisodeIndex,
      status: 'success',
      durationMs,
      message: `成功解析: [${movie.title}] ${activeEpisode.name} (${parseResult.type})`,
    });

    return {
      code: 200,
      success: true,
      message: 'success',
      data: {
        movieId,
        movieTitle: movie.title,
        source: activeSource.sourceName,
        sourceIndex: actualSourceIndex,
        episode: activeEpisode.name,
        episodeIndex: actualEpisodeIndex,
        type: parseResult.type,
        url: parseResult.cleanUrl,
        headers: parseResult.headers || {},
        expireAt: null,
        fallbackAvailable: alternativeSources.length > 0,
        alternativeSources,
      },
    };
  }
}

export const globalPlaybackResolver = new PlaybackResolver();
