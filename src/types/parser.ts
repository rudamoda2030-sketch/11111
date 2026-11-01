export type StreamType = 'hls' | 'mp4' | 'custom' | 'unknown';

export interface ResolveRequest {
  movieId: string | number;
  sourceIndex: number;
  episodeIndex: number;
  clientType?: string;
}

export interface PlaybackData {
  movieId: string | number;
  movieTitle?: string;
  source: string;
  sourceIndex: number;
  qualityTag?: string;
  episode: string;
  episodeIndex: number;
  type: StreamType;
  url: string;
  cleanProxyUrl?: string;
  isAdFiltered?: boolean;
  headers: Record<string, string>;
  expireAt: number | null;
  fallbackAvailable: boolean;
  alternativeSources?: Array<{
    sourceIndex: number;
    sourceName: string;
  }>;
  allSourcesSummary?: any[];
}

export interface ApiResponse<T = any> {
  code: number;
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: number;
}

export interface ParseResult {
  valid: boolean;
  type: StreamType;
  cleanUrl: string;
  headers?: Record<string, string>;
  error?: string;
  status: 'active' | 'forbidden' | 'invalid' | 'ssrf_blocked';
}

export interface PlaySourceInfo {
  code: string;
  name: string;
  enabled: boolean;
  type: 'direct_m3u8' | 'direct_mp4' | 'authorized_cdn';
  description: string;
  priority: number;
}
