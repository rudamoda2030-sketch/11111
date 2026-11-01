import { NextResponse } from 'next/server';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';
import { globalCache } from '@/server/cache/memoryCache';
import { globalAuditLogger } from '@/server/security/auditLogger';

export async function GET() {
  const startTime = Date.now();
  const cmsConfig = globalMacCmsClient.getActiveConfig();

  // Test lightweight CMS connectivity
  let cmsStatus = 'mock_mode';
  let cmsPingMs = 0;

  if (cmsConfig.baseUrl) {
    try {
      const pingRes = await globalMacCmsClient.fetchProvide({ ac: 'list', pg: 1 });
      cmsStatus = pingRes.isRemote ? 'connected' : 'offline_fallback';
      cmsPingMs = pingRes.latencyMs;
    } catch {
      cmsStatus = 'error';
    }
  }

  const cacheStats = globalCache.getStats();
  const metrics = globalAuditLogger.getMetrics();

  return NextResponse.json({
    code: 200,
    success: true,
    message: 'Parser API service healthy',
    data: {
      status: 'healthy',
      version: '1.2.0',
      service: 'MacCMS-V10-AdFree-JSON-Parser-Engine',
      uptimeSeconds: Math.floor(process.uptime()),
      cms: {
        status: cmsStatus,
        configured: cmsConfig.isConfigured,
        baseUrl: cmsConfig.baseUrl || '内置纯净模拟库 (已就绪)',
        providePath: cmsConfig.providePath,
        pingLatencyMs: cmsPingMs,
      },
      metrics,
      cache: cacheStats,
      serverTime: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    },
  });
}
