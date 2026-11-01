import { NextResponse } from 'next/server';
import { globalAuditLogger } from '@/server/security/auditLogger';
import { globalCache } from '@/server/cache/memoryCache';
import { globalSsrfGuard } from '@/server/security/ssrfGuard';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';

export async function GET() {
  const metrics = globalAuditLogger.getMetrics();
  const logs = globalAuditLogger.getRecentLogs(30);
  const cacheStats = globalCache.getStats();
  const allowedHosts = globalSsrfGuard.getAllowedHosts();
  const cmsConfig = globalMacCmsClient.getActiveConfig();

  return NextResponse.json({
    code: 200,
    success: true,
    message: 'success',
    data: {
      metrics,
      logs,
      cacheStats,
      allowedHosts,
      cmsConfig: {
        baseUrl: cmsConfig.baseUrl,
        providePath: cmsConfig.providePath,
        timeoutMs: cmsConfig.timeoutMs,
        isUsingDynamicUrl: cmsConfig.isUsingDynamicUrl,
        isConfigured: cmsConfig.isConfigured,
      },
    },
  });
}
