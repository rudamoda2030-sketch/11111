export interface MacCmsVideo {
  vod_id: number | string;
  vod_name: string;
  vod_play_from: string;
  vod_play_url: string;
}

export interface PlayEpisode {
  title: string;
  url: string;
  type?: StreamType;
  valid?: boolean;
  error?: string;
}

import { CleanStreamEngine } from '@/server/filter/cleanStreamEngine';

export interface PlaySource {
  name: string;
  episodes: PlayEpisode[];
  status?: 'active' | 'warning' | 'invalid';
  qualityTag?: string;
  error?: string;
}

export type StreamType = "hls" | "mp4";

export class ParserError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "ParserError";
  }
}

/**
 * MacCMS 多线路分组使用 $$$ 分隔。
 */
export function splitGroups(value: string): string[] {
  if (!value) return [];
  return value
    .split("$$$")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * 兼容处理各种播放线路名称格式：
 * 1. 标准 $$$ 分隔 (如 kkm3u8$$$ffm3u8$$$mp4)
 * 2. 逗号分隔 (如 kkm3u8,ffm3u8,mp4)
 * 3. 数量不一致时容错对齐，绝不让整部影片因此报错崩溃
 */
export function getSourceNames(
  from: string,
  groupCount: number
): string[] {
  if (!from && groupCount > 0) {
    return Array.from({ length: groupCount }, (_, i) => `线路${i + 1}`);
  }

  // 1. 优先尝试 $$$ 分割
  let names = splitGroups(from);

  // 2. 如果 $$$ 只有一个，但播放地址有多个，尝试以逗号或竖线分割
  if (names.length === 1 && groupCount > 1) {
    let altNames = from
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (altNames.length === 1) {
      // 兼容竖线或斜杠分割
      altNames = from
        .split(/[|/]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (altNames.length === groupCount) {
      names = altNames;
    }
  }

  // 3. 数量容错对齐：即使采集数据数量有轻微差异，也保证一一对应，避免破坏可用线路
  if (names.length < groupCount) {
    const padded = [...names];
    for (let i = names.length; i < groupCount; i++) {
      padded.push(`线路${i + 1}`);
    }
    return padded;
  } else if (names.length > groupCount && groupCount > 0) {
    return names.slice(0, groupCount);
  }

  return names;
}

/**
 * 解析单条剧集。
 * 格式：第1集$https://cdn.example.com/1.m3u8
 * 自动净化剧集名称中的博彩广告推广词
 */
export function parseEpisode(
  entry: string,
  index: number
): PlayEpisode {
  const value = entry.trim();
  const separator = value.indexOf("$");

  let title: string;
  let url: string;

  if (separator >= 0) {
    title = value.slice(0, separator).trim();
    url = value.slice(separator + 1).trim();
  } else {
    // 兼容直接存储视频地址的格式
    title = `第${index + 1}集`;
    url = value;
  }

  if (!url) {
    throw new ParserError(`第 ${index + 1} 集播放地址为空`, 422);
  }

  // 自动去除博彩垃圾字眼（如 "第01集【澳门新葡京】" -> "第01集"）
  const sanitized = CleanStreamEngine.sanitizeEpisodeTitle(title);
  title = sanitized.cleanTitle;

  return {
    title: title || `第${index + 1}集`,
    url
  };
}

/**
 * 拆分完整的 MacCMS 播放数据。
 *
 * vod_play_from:
 * line1$$$line2 或 line1,line2
 *
 * vod_play_url:
 * 第1集$url1#第2集$url2$$$第1集$url3
 */
export function parseMacCmsSources(
  video: MacCmsVideo
): PlaySource[] {
  if (
    !video.vod_play_from &&
    !video.vod_play_url
  ) {
    throw new ParserError("影片没有播放线路", 404);
  }

  const urlGroups = splitGroups(video.vod_play_url || "");

  if (urlGroups.length === 0) {
    throw new ParserError("影片播放地址列表为空", 404);
  }

  const names = getSourceNames(
    video.vod_play_from || "",
    urlGroups.length
  );

  return urlGroups.map((group, groupIndex) => {
    // 拆分 # 剧集，过滤空条目
    const rawEpisodes = group
      .split("#")
      .map((item) => item.trim())
      .filter(Boolean);

    const episodes: PlayEpisode[] = [];
    let hasError = false;
    let errorReason: string | undefined = undefined;

    if (rawEpisodes.length === 0) {
      return {
        name: names[groupIndex] || `线路${groupIndex + 1}`,
        episodes: [],
        status: 'invalid' as const,
        qualityTag: '空线路',
        error: '该线路下没有有效剧集',
      };
    }

    rawEpisodes.forEach((item, index) => {
      try {
        const ep = parseEpisode(item, index);
        episodes.push(ep);
      } catch (err: any) {
        hasError = true;
        errorReason = err.message;
      }
    });

    const lineName = names[groupIndex] || `线路${groupIndex + 1}`;
    const sampleUrl = episodes[0]?.url || '';
    const quality = CleanStreamEngine.scoreSourceQuality(lineName, sampleUrl);

    return {
      name: lineName,
      episodes,
      status: hasError ? ('warning' as const) : ('active' as const),
      qualityTag: quality.recommendedTag,
      error: errorReason,
    };
  });
}

/**
 * 播放地址安全验证与第三方广告解析拦截。
 *
 * 核心安全规则：
 * 1. 严格检查协议 (支持 https，开发可配置 http)
 * 2. 禁止含有凭证与非法字符
 * 3. 严格比对已授权域名白名单 (PLAYBACK_ALLOWED_HOSTS)
 * 4. 深度拦截第三方广告解析网站 (拦截如 jx, jiexi, .html, .php, ?url= 等带广告的网页嗅探中转地址)
 * 5. 严格验证流媒体格式 (仅放行标准 RFC 8216 HLS .m3u8 与直接 .mp4 流)
 */
export function validatePlaybackUrl(
  rawUrl: string
): {
  url: string;
  type: StreamType;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new ParserError("播放地址不能为空", 422);
  }

  let parsed: URL;

  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new ParserError("播放地址格式错误", 422);
  }

  const allowHttp =
    process.env.ALLOW_HTTP_PLAYBACK === "true";

  const allowedProtocols = allowHttp
    ? ["https:", "http:"]
    : ["https:"];

  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new ParserError(
      `不允许的播放协议: ${parsed.protocol}，生产环境必须使用 HTTPS`,
      403
    );
  }

  if (parsed.username || parsed.password) {
    throw new ParserError(
      "播放地址不允许携带用户名或密码",
      403
    );
  }

  // 拦截常见的第三方广告解析网站特征 (防止播放器进入带网页弹窗、跳转下载的第三方解析站)
  const lowerUrl = parsed.toString().toLowerCase();
  const lowerPath = parsed.pathname.toLowerCase();
  const isAdParserPage = 
    lowerUrl.includes('?url=') || 
    lowerUrl.includes('&url=') || 
    lowerPath.includes('/jx') || 
    lowerPath.includes('/jiexi') ||
    lowerPath.endsWith('.html') || 
    lowerPath.endsWith('.htm') || 
    lowerPath.endsWith('.php') || 
    lowerPath.endsWith('.jsp') || 
    lowerPath.endsWith('.asp');

  if (isAdParserPage && !lowerPath.includes('.m3u8') && !lowerPath.includes('.mp4')) {
    throw new ParserError(
      "拦截到第三方广告解析网页或中转页面，本服务仅直连播放授权直链视频流",
      422
    );
  }

  // 域名白名单匹配
  const allowedHostsConfig = (
    process.env.PLAYBACK_ALLOWED_HOSTS || 
    process.env.ALLOWED_PLAYBACK_HOSTS || 
    "ok.modaui.shop"
  )
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  const hostname = parsed.hostname.toLowerCase();

  const isAllowed = 
    allowedHostsConfig.length === 0 || 
    allowedHostsConfig.includes("*") || 
    allowedHostsConfig.some((allowed) => {
      if (allowed === hostname) return true;
      if (allowed.startsWith("*.")) {
        const root = allowed.slice(2);
        return hostname === root || hostname.endsWith("." + root);
      }
      return false;
    });

  if (!isAllowed) {
    throw new ParserError(
      `播放域名 [${hostname}] 未获得授权或未加入白名单`,
      403
    );
  }

  // 严格流媒体格式校验
  let type: StreamType;

  if (lowerPath.endsWith(".m3u8") || lowerPath.includes(".m3u8")) {
    type = "hls";
  } else if (lowerPath.endsWith(".mp4") || lowerPath.includes(".mp4")) {
    type = "mp4";
  } else {
    throw new ParserError(
      "不支持该播放格式，或该地址不是直接视频流（仅支持 HLS/M3U8 与 MP4）",
      422
    );
  }

  return {
    url: parsed.toString(),
    type
  };
}
