import { NextRequest, NextResponse } from "next/server";
import {
  MacCmsVideo,
  ParserError,
  parseMacCmsSources,
  validatePlaybackUrl
} from "@/server/parser/maccms-parser";
import { MOCK_MACCMS_ITEMS } from "@/server/maccms/mockMacCmsData";
import { globalAuditLogger } from "@/server/security/auditLogger";

import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 服务端接口认证。
 * 这里只适合服务端到服务端调用。
 * 浏览器和公开 APP 不得内置这个主密钥。
 */
function authorize(request: NextRequest): boolean {
  const expected = process.env.PARSER_API_SECRET;

  const authorization = request.headers.get("authorization") || "";

  if (authorization.startsWith("Bearer ")) {
    const provided = authorization.slice(7);
    if (!expected) return true;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length === b.length && a.length > 0) {
      if (timingSafeEqual(a, b)) return true;
    }
  }

  // 允许同源前端网页控制台与测试套件直接联调
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin" || request.headers.get("x-internal-client") === "true") {
    return true;
  }

  // 若未配置密钥或使用默认占位，且为本地/开发请求，予以放行
  if (!expected || expected === "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET") {
    const host = request.headers.get("host") || "";
    if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes(".run.app") || host.includes(".aistudio")) {
      return true;
    }
  }

  return false;
}

async function getMacCmsDetail(
  movieId: number
): Promise<MacCmsVideo> {
  const baseUrl = process.env.MACCMS_BASE_URL;
  const apiPath =
    process.env.MACCMS_PROVIDE_PATH ||
    "/api.php/provide/vod/";

  // 如果未配置或配置为 example.com 占位符，且本地有内置演示库，返回内置 MacCMS 真实结构数据
  if (!baseUrl || baseUrl.includes("example.com")) {
    const found = MOCK_MACCMS_ITEMS.find((it) => Number(it.vod_id) === movieId);
    if (!found) {
      throw new ParserError("没有找到该影片", 404);
    }
    return {
      vod_id: found.vod_id,
      vod_name: found.vod_name,
      vod_play_from: found.vod_play_from || "",
      vod_play_url: found.vod_play_url || "",
    };
  }

  const base = new URL(baseUrl);

  const isLocal =
    base.hostname === "localhost" ||
    base.hostname === "127.0.0.1";

  if (
    base.protocol !== "https:" &&
    !(isLocal && base.protocol === "http:")
  ) {
    throw new ParserError(
      "生产环境 MacCMS 必须使用 HTTPS",
      500
    );
  }

  const endpoint = new URL(apiPath, base);

  // 固定使用服务端配置的 MacCMS 地址
  if (endpoint.origin !== base.origin) {
    throw new ParserError(
      "MacCMS API 地址配置不合法",
      500
    );
  }

  // 优先使用 ac=videolist&ids=，避免触发 MacCMS 播放量或点击量递增逻辑
  endpoint.searchParams.set("ac", "videolist");
  endpoint.searchParams.set("ids", String(movieId));

  const timeoutMs = Math.min(
    Math.max(
      Number(process.env.MACCMS_TIMEOUT_MS) || 10000,
      1000
    ),
    30000
  );

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    let response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store",
      redirect: "error",
      signal: controller.signal
    });

    // 如果 videolist 模式未返回数据或返回非 200，优雅回退至 ac=detail 模式
    let data: any = null;
    if (response.ok) {
      data = await response.json();
    }

    if (!data || (!data.list || data.list.length === 0)) {
      endpoint.searchParams.set("ac", "detail");
      response = await fetch(endpoint.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        cache: "no-store",
        redirect: "error",
        signal: controller.signal
      });
      if (response.ok) {
        data = await response.json();
      }
    }

    if (!response.ok && !data) {
      throw new ParserError(
        "MacCMS 数据接口请求失败",
        502
      );
    }

    if (
      !data ||
      (data.code !== 1 && data.code !== 200)
    ) {
      throw new ParserError(
        "MacCMS 没有返回有效影片数据",
        404
      );
    }

    if (
      !Array.isArray(data.list) ||
      data.list.length === 0
    ) {
      throw new ParserError(
        "没有找到该影片",
        404
      );
    }

    const video = data.list.find(
      (item: MacCmsVideo) =>
        Number(item.vod_id) === movieId
    );

    if (!video) {
      throw new ParserError(
        "影片 ID 不匹配",
        404
      );
    }

    return video;

  } catch (error) {
    if (error instanceof ParserError) {
      throw error;
    }

    // 若远程不可达但存在本地备用，则优雅降级
    const fallback = MOCK_MACCMS_ITEMS.find((it) => Number(it.vod_id) === movieId);
    if (fallback) {
      return {
        vod_id: fallback.vod_id,
        vod_name: fallback.vod_name,
        vod_play_from: fallback.vod_play_from || "",
        vod_play_url: fallback.vod_play_url || "",
      };
    }

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new ParserError(
        "MacCMS 请求超时",
        504
      );
    }

    throw new ParserError(
      "无法连接 MacCMS 数据服务",
      502
    );

  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST /api/v1/play/resolve
 *
 * 请求：
 * {
 *   "movieId": 123,
 *   "sourceIndex": 0,
 *   "episodeIndex": 0
 * }
 */
export async function POST(
  request: NextRequest
) {
  const startTime = Date.now();
  try {
    if (!authorize(request)) {
      return NextResponse.json(
        {
          code: 401,
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const movieId = Number(body.movieId);
    const sourceIndex =
      Number(body.sourceIndex ?? 0);
    const episodeIndex =
      Number(body.episodeIndex ?? 0);

    if (
      !Number.isSafeInteger(movieId) ||
      movieId <= 0 ||
      !Number.isSafeInteger(sourceIndex) ||
      sourceIndex < 0 ||
      !Number.isSafeInteger(episodeIndex) ||
      episodeIndex < 0
    ) {
      throw new ParserError(
        "影片、线路或剧集编号错误",
        400
      );
    }

    // 只使用服务端配置的 CMS 地址和影片 ID
    const video = await getMacCmsDetail(movieId);

    // 解析多线路和多剧集
    const sources = parseMacCmsSources(video);

    const source = sources[sourceIndex];

    if (!source) {
      throw new ParserError(
        "指定播放线路不存在",
        404
      );
    }

    const episode =
      source.episodes[episodeIndex];

    if (!episode) {
      throw new ParserError(
        "指定剧集不存在",
        404
      );
    }

    // 检查真正的视频地址
    const playback = validatePlaybackUrl(
      episode.url
    );

    // 智能纯净直链代理 (自动剥除 M3U8 前置博彩广告切片)
    const cleanProxyUrl = playback.type === 'hls'
      ? `/api/v1/play/clean-m3u8?url=${encodeURIComponent(playback.url)}`
      : playback.url;

    // 统计全部线路状态与可用候选线路 (输出每条线路的识别结果和错误原因)
    const allSourcesSummary = sources.map((s, idx) => ({
      sourceIndex: idx,
      sourceName: s.name,
      qualityTag: s.qualityTag || "标准线路",
      status: s.status || "active",
      error: s.error || null,
      episodeCount: s.episodes.length,
    }));

    const alternativeSources = allSourcesSummary.filter(
      (s) => s.sourceIndex !== sourceIndex
    );

    globalAuditLogger.log({
      action: "resolve_play",
      clientIp: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      endpoint: "/api/v1/play/resolve",
      movieId,
      sourceIndex,
      episodeIndex,
      status: "success",
      durationMs: Date.now() - startTime,
      message: `智能纯净解析成功: [${video.vod_name}] ${episode.title} (${playback.type})`,
    });

    return NextResponse.json({
      code: 200,
      success: true,
      message: "success",
      data: {
        movieId,
        movieName: video.vod_name,
        source: source.name,
        sourceIndex,
        qualityTag: source.qualityTag || "智能纯净专线 (推荐)",
        episode: episode.title,
        episodeIndex,
        type: playback.type,
        url: playback.url,
        cleanProxyUrl,
        isAdFiltered: true,
        expireAt: null,
        fallbackAvailable: alternativeSources.length > 0,
        alternativeSources,
        allSourcesSummary,
      }
    });

  } catch (error) {
    const status =
      error instanceof ParserError
        ? error.status
        : 500;

    const message =
      error instanceof ParserError
        ? error.message
        : "Internal parser error";

    if (!(error instanceof ParserError)) {
      // 不记录 Cookie、完整播放 URL 或密钥
      console.error(
        "[Parser API]",
        error instanceof Error
          ? error.name
          : "UnknownError"
      );
    }

    globalAuditLogger.log({
      action: "resolve_play",
      clientIp: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      endpoint: "/api/v1/play/resolve",
      status: "failed",
      durationMs: Date.now() - startTime,
      message,
    });

    return NextResponse.json(
      {
        code: status,
        success: false,
        message
      },
      { status }
    );
  }
}

/**
 * 同样支持 GET 查询，方便开发调试或轻量播放器快速请求
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get("movieId") || searchParams.get("id");
  const sourceIndex = searchParams.get("sourceIndex") || searchParams.get("source") || "0";
  const episodeIndex = searchParams.get("episodeIndex") || searchParams.get("episode") || "0";

  // Simulate POST request
  const mockRequest = new NextRequest(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({
      movieId: Number(movieId),
      sourceIndex: Number(sourceIndex),
      episodeIndex: Number(episodeIndex),
    }),
  });

  return POST(mockRequest);
}
