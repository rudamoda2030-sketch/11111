import { NextRequest, NextResponse } from 'next/server';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';
import { globalSsrfGuard } from '@/server/security/ssrfGuard';
import { globalCache } from '@/server/cache/memoryCache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'set_cms_url') {
      const { url } = payload || {};
      globalMacCmsClient.setDynamicBaseUrl(url || null);
      globalCache.clear(); // Clear cached categories and movies to fetch fresh
      return NextResponse.json({
        code: 200,
        success: true,
        message: url ? `已更新 MacCMS 基础地址为: ${url}` : '已恢复默认/内置 MacCMS 数据源',
      });
    }

    if (action === 'add_whitelist_host') {
      const { host } = payload || {};
      if (!host || typeof host !== 'string') {
        return NextResponse.json({ code: 400, success: false, message: '域名不能为空' }, { status: 400 });
      }
      globalSsrfGuard.addAllowedHost(host);
      return NextResponse.json({
        code: 200,
        success: true,
        message: `成功将 [${host}] 添加至播放白名单`,
      });
    }

    if (action === 'remove_whitelist_host') {
      const { host } = payload || {};
      if (!host) {
        return NextResponse.json({ code: 400, success: false, message: '域名不能为空' }, { status: 400 });
      }
      globalSsrfGuard.removeAllowedHost(host);
      return NextResponse.json({
        code: 200,
        success: true,
        message: `已从白名单移除 [${host}]`,
      });
    }

    if (action === 'test_cms_connection') {
      const { url } = payload || {};
      const testClient = globalMacCmsClient;
      if (url) {
        testClient.setDynamicBaseUrl(url);
      }
      const startTime = Date.now();
      const res = await testClient.fetchProvide({ ac: 'list', pg: 1 });
      const latencyMs = Date.now() - startTime;

      return NextResponse.json({
        code: 200,
        success: true,
        message: res.isRemote ? '成功连接至远程 MacCMS V10' : '未连接远程服务 (使用本地纯净模式)',
        data: {
          isRemote: res.isRemote,
          latencyMs,
          categoryCount: res.response.class?.length || 0,
          totalMovies: res.response.total || 0,
          sampleList: (res.response.list || []).slice(0, 3).map(i => ({ id: i.vod_id, name: i.vod_name })),
        },
      });
    }

    if (action === 'clear_cache') {
      globalCache.clear();
      return NextResponse.json({
        code: 200,
        success: true,
        message: '已成功清理所有内存与接口缓存',
      });
    }

    return NextResponse.json({
      code: 400,
      success: false,
      message: `未知操作: ${action}`,
    }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      code: 500,
      success: false,
      message: error.message || '更新配置发生异常',
    }, { status: 500 });
  }
}
