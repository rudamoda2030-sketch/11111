import { 
  MacCmsProvideResponse, 
  MacCmsRawVodItem, 
  NormalizedMovieDetail, 
  MacCmsCategory 
} from '@/types/maccms';
import { MOCK_MACCMS_CATEGORIES, MOCK_MACCMS_ITEMS } from './mockMacCmsData';
import { normalizeVodItem } from './maccmsParser';
import { globalCache } from '../cache/memoryCache';
import { globalAuditLogger } from '../security/auditLogger';

export interface MacCmsConfig {
  baseUrl: string;
  providePath: string;
  timeoutMs: number;
  apiToken?: string;
}

export class MacCmsClient {
  private config: MacCmsConfig;
  private overrideBaseUrl: string | null = null;

  constructor() {
    this.config = {
      baseUrl: (process.env.MACCMS_BASE_URL || 'https://ok.modaui.shop').trim(),
      providePath: (process.env.MACCMS_PROVIDE_PATH || '/api.php/provide/vod/').trim(),
      timeoutMs: parseInt(process.env.MACCMS_TIMEOUT_MS || '10000', 10),
      apiToken: (process.env.MACCMS_API_TOKEN || '').trim(),
    };
  }

  public setDynamicBaseUrl(url: string | null) {
    this.overrideBaseUrl = url && url.trim() ? url.trim() : null;
  }

  public getActiveConfig(): MacCmsConfig & { isUsingDynamicUrl: boolean; isConfigured: boolean } {
    const activeUrl = this.overrideBaseUrl || this.config.baseUrl;
    return {
      baseUrl: activeUrl,
      providePath: this.config.providePath,
      timeoutMs: this.config.timeoutMs,
      apiToken: this.config.apiToken,
      isUsingDynamicUrl: !!this.overrideBaseUrl,
      isConfigured: !!activeUrl,
    };
  }

  /**
   * Fetches raw provide response from MacCMS or returns authentic mock data if not configured/offline
   */
  public async fetchProvide(params: {
    ac: 'list' | 'videolist' | 'detail';
    pg?: number;
    t?: number;
    wd?: string;
    ids?: string;
    h?: number;
  }): Promise<{ response: MacCmsProvideResponse; isRemote: boolean; latencyMs: number }> {
    const startTime = Date.now();
    const activeUrl = this.overrideBaseUrl || this.config.baseUrl;

    // If no remote URL configured, serve local mock data immediately
    if (!activeUrl) {
      const mockResult = this.filterMockData(params);
      return {
        response: mockResult,
        isRemote: false,
        latencyMs: Date.now() - startTime,
      };
    }

    // Build URL
    let targetUrl: string;
    try {
      const normalizedBase = activeUrl.endsWith('/') ? activeUrl.slice(0, -1) : activeUrl;
      const normalizedPath = this.config.providePath.startsWith('/') ? this.config.providePath : `/${this.config.providePath}`;
      const url = new URL(`${normalizedBase}${normalizedPath}`);

      url.searchParams.set('ac', params.ac);
      if (params.pg) url.searchParams.set('pg', String(params.pg));
      if (params.t) url.searchParams.set('t', String(params.t));
      if (params.wd) url.searchParams.set('wd', params.wd);
      if (params.ids) url.searchParams.set('ids', params.ids);
      if (params.h) url.searchParams.set('h', String(params.h));

      if (this.config.apiToken) {
        url.searchParams.set('token', this.config.apiToken);
      }

      targetUrl = url.toString();
    } catch (e: any) {
      // Invalid URL format, fallback to mock
      const mockResult = this.filterMockData(params);
      return {
        response: mockResult,
        isRemote: false,
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MacCMS-API-Parser-Engine/1.0',
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`MacCMS HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const latencyMs = Date.now() - startTime;

      globalAuditLogger.log({
        action: 'fetch_maccms',
        clientIp: 'internal',
        endpoint: targetUrl.split('?')[0],
        status: 'success',
        durationMs: latencyMs,
        message: `Remote MacCMS query ac=${params.ac} successful`,
      });

      return {
        response: json,
        isRemote: true,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      globalAuditLogger.log({
        action: 'fetch_maccms',
        clientIp: 'internal',
        endpoint: targetUrl.split('?')[0],
        status: 'failed',
        durationMs: latencyMs,
        message: `Remote MacCMS failed (${err.message}). Using local fallback items.`,
      });

      // Fallback to local mock data to prevent complete disruption
      const mockResult = this.filterMockData(params);
      return {
        response: mockResult,
        isRemote: false,
        latencyMs,
      };
    }
  }

  /**
   * Returns movie categories with cache
   */
  public async getCategories(): Promise<MacCmsCategory[]> {
    const cacheKey = 'maccms_categories';
    const cached = globalCache.get<MacCmsCategory[]>(cacheKey);
    if (cached) return cached;

    const { response } = await this.fetchProvide({ ac: 'list' });
    const categories = response.class && response.class.length > 0 
      ? response.class 
      : MOCK_MACCMS_CATEGORIES;

    globalCache.set(cacheKey, categories, 600); // 10 minutes cache
    return categories;
  }

  /**
   * Returns movies list with pagination and search
   */
  public async getMovies(options: {
    page?: number;
    typeId?: number;
    keyword?: string;
    hours?: number;
  }): Promise<{
    list: NormalizedMovieDetail[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    isRemote: boolean;
  }> {
    const page = options.page || 1;
    const cacheKey = `maccms_movies_${page}_${options.typeId || 0}_${options.keyword || ''}`;
    const cached = globalCache.get<any>(cacheKey);
    if (cached) return cached;

    // Query with ac=videolist to get full metadata and play sources
    const { response, isRemote } = await this.fetchProvide({
      ac: 'videolist',
      pg: page,
      t: options.typeId,
      wd: options.keyword,
      h: options.hours,
    });

    const normalizedList = (response.list || []).map(normalizeVodItem);
    const limit = Number(response.limit) || 20;
    const total = Number(response.total) || normalizedList.length;
    const pageCount = response.pagecount || Math.ceil(total / (limit || 1)) || 1;

    const result = {
      list: normalizedList,
      total,
      page,
      limit,
      pageCount,
      isRemote,
    };

    globalCache.set(cacheKey, result, 60); // 1 minute cache
    return result;
  }

  /**
   * Returns detailed movie by ID
   */
  public async getMovieById(id: string | number): Promise<NormalizedMovieDetail | null> {
    const cacheKey = `maccms_movie_detail_${id}`;
    const cached = globalCache.get<NormalizedMovieDetail>(cacheKey);
    if (cached) return cached;

    const { response } = await this.fetchProvide({
      ac: 'detail',
      ids: String(id),
    });

    const found = (response.list || []).find(item => String(item.vod_id) === String(id));
    if (!found) {
      return null;
    }

    const normalized = normalizeVodItem(found);
    globalCache.set(cacheKey, normalized, 120); // 2 minutes cache
    return normalized;
  }

  /**
   * Mock data filter matching MacCMS V10 rules
   */
  private filterMockData(params: {
    ac: 'list' | 'videolist' | 'detail';
    pg?: number;
    t?: number;
    wd?: string;
    ids?: string;
    h?: number;
  }): MacCmsProvideResponse {
    let items = [...MOCK_MACCMS_ITEMS];

    if (params.ids) {
      const idSet = new Set(params.ids.split(',').map(s => s.trim()));
      items = items.filter(it => idSet.has(String(it.vod_id)));
    }

    if (params.t) {
      const targetTid = Number(params.t);
      items = items.filter(it => it.type_id === targetTid);
    }

    if (params.wd) {
      const q = params.wd.toLowerCase().trim();
      items = items.filter(it => 
        it.vod_name.toLowerCase().includes(q) ||
        (it.vod_actor && it.vod_actor.toLowerCase().includes(q)) ||
        (it.vod_director && it.vod_director.toLowerCase().includes(q)) ||
        (it.vod_en && it.vod_en.toLowerCase().includes(q))
      );
    }

    const limit = 20;
    const page = params.pg || 1;
    const total = items.length;
    const pagecount = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const pagedItems = items.slice(startIndex, startIndex + limit);

    // If ac=list, strip heavy fields according to standard MacCMS V10 specification
    const returnList = params.ac === 'list'
      ? pagedItems.map(it => ({
          vod_id: it.vod_id,
          vod_name: it.vod_name,
          type_id: it.type_id,
          type_name: it.type_name,
          vod_en: it.vod_en,
          vod_time: it.vod_time,
          vod_remarks: it.vod_remarks,
        } as MacCmsRawVodItem))
      : pagedItems;

    return {
      code: 1,
      msg: '数据获取成功',
      page,
      pagecount,
      limit,
      total,
      list: returnList,
      class: MOCK_MACCMS_CATEGORIES,
    };
  }
}

export const globalMacCmsClient = new MacCmsClient();
