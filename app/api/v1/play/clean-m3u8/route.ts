import { NextRequest, NextResponse } from 'next/server';
import { CleanStreamEngine } from '@/server/filter/cleanStreamEngine';
import { validatePlaybackUrl } from '@/server/parser/maccms-parser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('缺少视频地址参数', { status: 400 });
  }

  try {
    // 1. 安全与白名单验证 (防止通过此代理进行 SSRF)
    const valid = validatePlaybackUrl(targetUrl);

    // 2. 拉取 M3U8 文本
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(valid.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': '*/*',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return new NextResponse(`上游流媒体响应错误: ${res.status}`, { status: res.status });
    }

    const text = await res.text();

    // 3. 智能清洗 M3U8 文本，剔除前置博彩广告切片并将相对路径自动补全
    const cleanText = CleanStreamEngine.cleanM3u8Content(text, valid.url);

    return new NextResponse(cleanText, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
        'X-Clean-Stream': 'anti-gambling-filter-applied',
      },
    });
  } catch (err: any) {
    return new NextResponse(`流媒体纯净处理失败: ${err.message}`, { status: 502 });
  }
}
