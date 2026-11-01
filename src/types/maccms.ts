export interface MacCmsCategory {
  type_id: number;
  type_name: string;
  type_pid?: number;
}

export interface MacCmsRawVodItem {
  vod_id: number | string;
  vod_name: string;
  type_id: number;
  type_name: string;
  vod_en?: string;
  vod_time?: string;
  vod_remarks?: string;
  vod_play_from?: string;
  vod_play_server?: string;
  vod_play_note?: string;
  vod_play_url?: string;
  vod_pic?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_writer?: string;
  vod_blurb?: string;
  vod_content?: string;
  vod_pubdate?: string;
  vod_total?: number;
  vod_serial?: string;
  vod_tv?: string;
  vod_weekday?: string;
  vod_area?: string;
  vod_lang?: string;
  vod_year?: string;
  vod_version?: string;
  vod_state?: string;
  vod_author?: string;
  vod_jumpurl?: string;
  vod_tpl?: string;
  vod_tpl_play?: string;
  vod_tpl_down?: string;
  vod_isend?: number;
  vod_lock?: number;
  vod_level?: number;
  vod_points_play?: number;
  vod_points_down?: number;
  vod_hits?: number;
  vod_hits_day?: number;
  vod_hits_week?: number;
  vod_hits_month?: number;
  vod_duration?: string;
  vod_up?: number;
  vod_down?: number;
  vod_score?: string;
  vod_score_all?: number;
  vod_score_num?: number;
}

export interface MacCmsProvideResponse {
  code: number;
  msg: string;
  page: number | string;
  pagecount: number;
  limit: number | string;
  total: number;
  list: MacCmsRawVodItem[];
  class?: MacCmsCategory[];
}

export interface ParsedEpisode {
  episodeIndex: number;
  name: string;
  rawUrl: string;
  url?: string;
  format: 'hls' | 'mp4' | 'unknown';
}

export interface ParsedPlaySource {
  sourceIndex: number;
  sourceCode: string;
  sourceName: string;
  name?: string;
  server?: string;
  note?: string;
  episodes: ParsedEpisode[];
}

export type PlaySource = ParsedPlaySource;
export type PlayEpisode = ParsedEpisode;

export interface NormalizedMovieDetail {
  id: string | number;
  title: string;
  typeId: number;
  typeName: string;
  poster: string;
  remarks: string;
  year: string;
  area: string;
  language: string;
  actors: string;
  directors: string;
  actor?: string;
  director?: string;
  description: string;
  updatedAt: string;
  score: string;
  sources: ParsedPlaySource[];
}
