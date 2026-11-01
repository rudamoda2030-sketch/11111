import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || '';

  return NextResponse.json({
    code: 200,
    success: true,
    message: 'success',
    data: {
      appName: 'MacCMS V10 独立无广告解析系统',
      version: '1.2.0',
      description: '自建无广告独立 JSON 视频流解析服务与苹果影视APP适配器',
      adFree: true,
      endpoints: {
        // Standard MacCMS V10 provide compatible endpoint
        maccmsProvideApi: `${origin}/api/provide/vod`,
        // Custom JSON parser endpoint
        jsonParserApi: `${origin}/api/v1/play/resolve`,
        // Movie list and detail
        movieListApi: `${origin}/api/v1/movies`,
        movieDetailApi: `${origin}/api/v1/movies/{id}`,
        categoriesApi: `${origin}/api/v1/categories`,
        sourcesApi: `${origin}/api/v1/sources`,
      },
      playerConfig: {
        defaultStreamType: 'hls',
        supportedFormats: ['hls', 'm3u8', 'mp4'],
        autoFallback: true,
        bufferSeconds: 30,
        enableNativeHlsOnIos: true,
      },
      security: {
        ssrfProtection: true,
        domainWhitelistEnforced: true,
        rateLimit: '90 req/min',
      },
      appleAppImportGuide: {
        type: 'maccms_v10',
        name: '自建纯净解析专线',
        api: `${origin}/api/provide/vod`,
        parseApi: `${origin}/api/v1/play/resolve`,
      },
    },
  });
}
