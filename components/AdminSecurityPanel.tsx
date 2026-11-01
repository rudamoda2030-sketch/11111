'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Database, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock,
  Zap,
  Globe,
  Sliders
} from 'lucide-react';

export default function AdminSecurityPanel() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newHost, setNewHost] = useState('');
  const [customCmsUrl, setCustomCmsUrl] = useState('');
  const [testCmsStatus, setTestCmsStatus] = useState<any>(null);
  const [isTestingCms, setIsTestingCms] = useState(false);
  const [opNotice, setOpNotice] = useState<string | null>(null);

  const loadStats = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/stats');
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('加载系统统计失败', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStats();
    }, 0);
    const interval = setInterval(loadStats, 8000); // Poll metrics every 8s
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadStats]);

  const showNotification = (msg: string) => {
    setOpNotice(msg);
    setTimeout(() => setOpNotice(null), 3500);
  };

  const handleAddHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHost.trim()) return;
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_whitelist_host',
          payload: { host: newHost.trim() },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setNewHost('');
        loadStats();
      }
    } catch (e: any) {
      showNotification(`添加失败: ${e.message}`);
    }
  };

  const handleRemoveHost = async (host: string) => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_whitelist_host',
          payload: { host },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadStats();
      }
    } catch (e: any) {
      showNotification(`移除失败: ${e.message}`);
    }
  };

  const handleUpdateCmsUrl = async () => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_cms_url',
          payload: { url: customCmsUrl.trim() },
        }),
      });
      const data = await res.json();
      showNotification(data.message);
      loadStats();
    } catch (e: any) {
      showNotification(`更新失败: ${e.message}`);
    }
  };

  const handleTestCmsConnection = async () => {
    setIsTestingCms(true);
    setTestCmsStatus(null);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_cms_connection',
          payload: { url: customCmsUrl.trim() },
        }),
      });
      const data = await res.json();
      setTestCmsStatus(data);
    } catch (e: any) {
      setTestCmsStatus({ error: e.message });
    } finally {
      setIsTestingCms(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_cache' }),
      });
      const data = await res.json();
      showNotification(data.message);
      loadStats();
    } catch (e: any) {
      showNotification(`清理缓存失败: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {opNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{opNotice}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">系统后台与安全审计中心</h2>
            <p className="text-xs text-neutral-400">
              监控解析吞吐、成功率、SSRF 防护状态、播放源域名白名单及实时安全审计日志
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl border border-neutral-700 transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>刷新接口缓存</span>
          </button>
          <button
            onClick={loadStats}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl border border-neutral-700 transition cursor-pointer"
            title="刷新数据"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="p-4 bg-neutral-900/90 rounded-xl border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block mb-1">API 总调用数</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats?.metrics?.totalRequests ?? 0}
            </span>
            <span className="text-xs text-neutral-500">次</span>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/90 rounded-xl border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block mb-1">播放解析成功率</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {stats?.metrics?.successRate ?? '100%'}
            </span>
            <span className="text-[10px] text-neutral-500">({stats?.metrics?.successfulResolves ?? 0} 成功)</span>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/90 rounded-xl border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block mb-1">平均接口响应</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-sky-400">
              {stats?.metrics?.avgLatencyMs ?? 0}
            </span>
            <span className="text-xs text-neutral-500">ms</span>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/90 rounded-xl border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block mb-1">SSRF 恶意拦截</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {stats?.metrics?.blockedSsrfCount ?? 0}
            </span>
            <span className="text-xs text-neutral-500">次拦截</span>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/90 rounded-xl border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block mb-1">内存缓存命中率</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {stats?.cacheStats?.hitRate ?? '0%'}
            </span>
            <span className="text-[10px] text-neutral-500">({stats?.cacheStats?.activeEntries ?? 0} 活跃项)</span>
          </div>
        </div>

      </div>

      {/* MacCMS Configuration & Whitelist Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Dynamic MacCMS Connection Manager */}
        <div className="lg:col-span-6 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">MacCMS V10 服务端连接管理</h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            生产环境支持通过系统环境变量 <code className="text-emerald-400">MACCMS_BASE_URL</code> 注入，您也可以在此输入并实时验证您的 MacCMS 实例：
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                MacCMS 基础地址 (Base URL)
              </label>
              <input
                type="text"
                placeholder="https://your-maccms-domain.com"
                value={customCmsUrl}
                onChange={(e) => setCustomCmsUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdateCmsUrl}
                className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                应用并保存基础地址
              </button>
              <button
                onClick={handleTestCmsConnection}
                disabled={isTestingCms}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{isTestingCms ? '测试中...' : '测试连通性'}</span>
              </button>
            </div>

            {testCmsStatus && (
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${testCmsStatus.success ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-white">{testCmsStatus.message}</span>
                </div>
                {testCmsStatus.data && (
                  <p className="text-neutral-400 text-[11px]">
                    连通延迟: {testCmsStatus.data.latencyMs}ms · 影片总数: {testCmsStatus.data.totalMovies} · 分类数: {testCmsStatus.data.categoryCount}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Allowed Hosts / Domain Whitelist */}
        <div className="lg:col-span-6 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">播放源域名安全白名单</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {stats?.allowedHosts?.length ?? 0} 个受信任域名规则
            </span>
          </div>

          <p className="text-xs text-neutral-400">
            仅放行经过许可的流媒体 CDN，严禁内网探测与 SSRF 恶意地址穿透：
          </p>

          <form onSubmit={handleAddHost} className="flex gap-2">
            <input
              type="text"
              placeholder="新增域名规则，如: *.mycdn.com 或 cdn.example.com"
              value={newHost}
              onChange={(e) => setNewHost(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            {stats?.allowedHosts?.map((host: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300"
              >
                <span>{host}</span>
                <button
                  onClick={() => handleRemoveHost(host)}
                  className="text-neutral-500 hover:text-rose-400 cursor-pointer"
                  title="移除白名单"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Real-time Audit & Access Log Stream */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">实时接口访问与安全审计日志</h3>
          </div>
          <span className="text-xs text-neutral-500">最近 30 条安全流水 (敏感参数已脱敏)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-2 font-medium">时间</th>
                <th className="pb-2 font-medium">操作类型</th>
                <th className="pb-2 font-medium">状态</th>
                <th className="pb-2 font-medium">耗时</th>
                <th className="pb-2 font-medium">客户端 IP</th>
                <th className="pb-2 font-medium">事件详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {stats?.logs && stats.logs.length > 0 ? (
                stats.logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-neutral-850/50">
                    <td className="py-2.5 text-neutral-500 text-[11px]" suppressHydrationWarning>
                      {log.timestamp ? log.timestamp.substring(11, 19) : '--:--:--'}
                    </td>
                    <td className="py-2.5 text-sky-400">{log.action}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        log.status === 'blocked' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 text-neutral-400">{log.durationMs}ms</td>
                    <td className="py-2.5 text-neutral-500">{log.clientIp}</td>
                    <td className="py-2.5 text-neutral-300 font-sans text-xs truncate max-w-xs" title={log.message}>
                      {log.message || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-500 font-sans">
                    暂无审计日志
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
