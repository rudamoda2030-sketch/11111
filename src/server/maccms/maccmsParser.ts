import { 
  MacCmsRawVodItem, 
  NormalizedMovieDetail, 
  ParsedPlaySource, 
  ParsedEpisode 
} from '@/types/maccms';

/**
 * Standard source display name mappings for common MacCMS crawlers/encoders
 */
const SOURCE_NAME_MAP: Record<string, string> = {
  kkm3u8: '快看资源 (HLS)',
  ffm3u8: '非凡资源 (HLS)',
  lzm3u8: '量子资源 (HLS)',
  hnm3u8: '红牛资源 (HLS)',
  bjm3u8: '暴风资源 (HLS)',
  snm3u8: '索尼资源 (HLS)',
  wjm3u8: '无尽资源 (HLS)',
  tkm3u8: '天空资源 (HLS)',
  dbm3u8: '豆瓣资源 (HLS)',
  hls: '标准 HLS 直连',
  m3u8: '超清 M3U8 直播/点播',
  mp4: '高品质 MP4 直链',
  youku: '优酷直通 (授权)',
  qiyi: '爱奇艺直通 (授权)',
  qq: '腾讯视频直通 (授权)',
  bilibili: 'B站视频 (授权)',
  custom: '独立解析线路',
};

/**
 * Parses the raw MacCMS vod_play_from and vod_play_url format:
 * vod_play_from: "kkm3u8$$$youku$$$qq"
 * vod_play_url: "第01集$http://a.m3u8#第02集$http://b.m3u8$$$第01集$http://c.mp4$$$..."
 */
export function parsePlaySources(
  rawPlayFrom?: string, 
  rawPlayUrl?: string, 
  rawPlayServer?: string, 
  rawPlayNote?: string
): ParsedPlaySource[] {
  if (!rawPlayFrom && !rawPlayUrl) {
    return [];
  }

  // Split sources by $$$ delimiter
  const fromGroups = (rawPlayFrom || '').split('$$$').map(s => s.trim()).filter(Boolean);
  const urlGroups = (rawPlayUrl || '').split('$$$');
  const serverGroups = (rawPlayServer || '').split('$$$');
  const noteGroups = (rawPlayNote || '').split('$$$');

  // Handle case where url exists but play_from was empty or shorter
  const count = Math.max(fromGroups.length, urlGroups.length);
  const sources: ParsedPlaySource[] = [];

  for (let i = 0; i < count; i++) {
    const rawCode = fromGroups[i] || `source_${i + 1}`;
    const rawSourceUrlGroup = urlGroups[i] || '';
    const server = serverGroups[i] || '';
    const note = noteGroups[i] || '';

    // Split episodes by #
    const rawEpisodeItems = rawSourceUrlGroup.split('#').map(e => e.trim()).filter(Boolean);
    const episodes: ParsedEpisode[] = [];

    rawEpisodeItems.forEach((itemStr, epIdx) => {
      // Correctly extract episode name and URL by finding first $ occurrence
      // DO NOT just use itemStr.split('$')[1]!
      const dollarIndex = itemStr.indexOf('$');
      let epName = '';
      let playUrl = '';

      if (dollarIndex === -1) {
        // No $ symbol, e.g. "http://example.com/play.m3u8"
        // If it's a URL directly:
        if (itemStr.startsWith('http://') || itemStr.startsWith('https://')) {
          epName = rawEpisodeItems.length === 1 ? '正片' : `第${epIdx + 1}集`;
          playUrl = itemStr;
        } else {
          epName = itemStr;
          playUrl = '';
        }
      } else {
        epName = itemStr.substring(0, dollarIndex).trim() || (rawEpisodeItems.length === 1 ? '正片' : `第${epIdx + 1}集`);
        playUrl = itemStr.substring(dollarIndex + 1).trim();
      }

      // Detect stream format
      const lowerUrl = playUrl.toLowerCase();
      let format: 'hls' | 'mp4' | 'unknown' = 'unknown';
      if (lowerUrl.includes('.m3u8') || lowerUrl.includes('m3u8') || rawCode.toLowerCase().includes('m3u8')) {
        format = 'hls';
      } else if (lowerUrl.includes('.mp4') || rawCode.toLowerCase().includes('mp4')) {
        format = 'mp4';
      }

      episodes.push({
        episodeIndex: epIdx,
        name: epName,
        rawUrl: playUrl,
        format,
      });
    });

    // Friendly display name
    const friendlyName = SOURCE_NAME_MAP[rawCode.toLowerCase()] || 
      (rawCode.toUpperCase() + (rawCode.toLowerCase().includes('m3u8') ? ' 蓝光' : ' 线路'));

    sources.push({
      sourceIndex: i,
      sourceCode: rawCode,
      sourceName: friendlyName,
      server,
      note,
      episodes,
    });
  }

  return sources;
}

/**
 * Normalizes a MacCMS raw item into a clean application model
 */
export function normalizeVodItem(raw: MacCmsRawVodItem): NormalizedMovieDetail {
  const sources = parsePlaySources(
    raw.vod_play_from,
    raw.vod_play_url,
    raw.vod_play_server,
    raw.vod_play_note
  );

  return {
    id: raw.vod_id,
    title: raw.vod_name || '未命名影片',
    typeId: Number(raw.type_id) || 0,
    typeName: raw.type_name || '未分类',
    poster: raw.vod_pic || '',
    remarks: raw.vod_remarks || '',
    year: raw.vod_year || '',
    area: raw.vod_area || '',
    language: raw.vod_lang || '',
    actors: raw.vod_actor || '',
    directors: raw.vod_director || '',
    description: (raw.vod_content || raw.vod_blurb || '').replace(/<[^>]*>?/gm, '').trim(),
    updatedAt: raw.vod_time || '',
    score: raw.vod_score || '8.8',
    sources,
  };
}
