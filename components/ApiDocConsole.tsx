'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Smartphone, 
  Layers, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ApiEndpointDef {
  method: 'GET' | 'POST';
  path: string;
  name: string;
  description: string;
  paramsExample?: string;
  bodyExample?: any;
}

const ENDPOINTS: ApiEndpointDef[] = [
  {
    method: 'GET',
    path: '/api/v1/health',
    name: '服务健康与 CMS 状态',
    description: '检查服务状态、MacCMS 连接耗时、缓存命中率及解析成功率。',
  },
  {
    method: 'GET',
    path: '/api/v1/categories',
    name: '电影分类列表',
    description: '获取 MacCMS 分类树（支持缓存 10 分钟）。',
  },
  {
    method: 'GET',
    path: '/api/v1/movies',
    name: '影片列表与检索',
    description: '获取影片列表，支持分页 (page)、分类 (typeId) 和关键词检索 (keyword)。',
    paramsExample: 'page=1&typeId=1&keyword=大雄兔',
  },
  {
    method: 'GET',
    path: '/api/v1/movies/1001',
    name: '影片详情与多线路数据',
    description: '获取指定影片详情，自动将 vod_play_from 和 vod_play_url 解析为结构化线路与剧集。',
  },
  {
    method: 'GET',
    path: '/api/v1/sources',
    name: '已批准播放线路',
    description: '列出系统支持和已通过安全审核的播放线路代码与格式。',
  },
  {
    method: 'POST',
    path: '/api/v1/play/resolve',
    name: '独立 JSON 播放解析接口',
    description: '根据影片 ID、线路索引和集数索引解析出纯净直链播放地址，杜绝第三方网页广告。',
    bodyExample: {
      movieId: 1001,
      sourceIndex: 0,
      episodeIndex: 0,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/app/config',
    name: '苹果电影软件配置接口',
    description: '返回符合苹果电影 App 与各类影视客户端标准的数据源与解析配置。',
  },
  {
    method: 'GET',
    path: '/api/provide/vod',
    name: 'MacCMS V10 标准 Provide 兼容接口',
    description: '完全兼容苹果 CMS V10 原生采集协议 (ac=list, ac=videolist, ac=detail)，客户端可直接填入作为原生源。',
    paramsExample: 'ac=videolist&pg=1',
  },
];

export default function ApiDocConsole() {
  const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpointDef>(ENDPOINTS[5]); // Default to /api/v1/play/resolve
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runApiTest = async (ep: ApiEndpointDef) => {
    setIsLoading(true);
    setTestResponse(null);

    let url = ep.path;
    if (ep.paramsExample) {
      url += `?${ep.paramsExample}`;
    }

    try {
      const options: RequestInit = {
        method: ep.method,
      };

      if (ep.method === 'POST' && ep.bodyExample) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(ep.bodyExample);
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setTestResponse({
        httpStatus: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      });
    } catch (err: any) {
      setTestResponse({
        error: err.message || '请求失败',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Apple App Integration Guide Box */}
      <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-sky-950/40 rounded-2xl border border-sky-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Smartphone className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">苹果电影软件与客户端快速对接配置</h2>
            <p className="text-xs text-neutral-400">
              支持原生 MacCMS V10 采集源协议对接，以及自定义独立 JSON 播放解析接口模式
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Method A: Native MacCMS V10 VOD Mode */}
          <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">A</span>
                模式一：原生 MacCMS V10 采集源接入
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                推荐 (最简)
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              客户端原生支持苹果 CMS V10 时，在 App 的「添加数据源」或「自定义源」中直接输入：
            </p>
            <div className="flex items-center gap-2 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 font-mono text-xs text-emerald-400">
              <span className="flex-1 truncate">/api/provide/vod</span>
              <button
                onClick={() => copyToClipboard(window.location.origin + '/api/provide/vod', 'mode_a')}
                className="text-xs text-sky-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedKey === 'mode_a' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>复制完整 URL</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              协议标准：ac=list / ac=videolist / ac=detail，无广告中转，直达流媒体。
            </p>
          </div>

          {/* Method B: Independent JSON Parser API Mode */}
          <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">B</span>
                模式二：独立 JSON 解析接口接入
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                高级自控
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              客户端支持配置自建解析接口 (JSON Parser) 时，填入解析接口地址：
            </p>
            <div className="flex items-center gap-2 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 font-mono text-xs text-emerald-400">
              <span className="flex-1 truncate">/api/v1/play/resolve</span>
              <button
                onClick={() => copyToClipboard(window.location.origin + '/api/v1/play/resolve', 'mode_b')}
                className="text-xs text-sky-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedKey === 'mode_b' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>复制完整 URL</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              返回标准 JSON：包含 movieId, source, episode, type, url, headers。
            </p>
          </div>

        </div>
      </div>

      {/* API Reference & Live Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Endpoint List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              系统全部开放 API 路由清单
            </span>
            <span className="text-xs text-neutral-500">共 {ENDPOINTS.length} 个接口</span>
          </div>

          <div className="space-y-2">
            {ENDPOINTS.map((ep, idx) => {
              const isSelected = activeEndpoint.path === ep.path && activeEndpoint.method === ep.method;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveEndpoint(ep);
                    setTestResponse(null);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-neutral-850 border-emerald-500/60 shadow-md shadow-emerald-950/50' 
                      : 'bg-neutral-900 border-neutral-800/80 hover:bg-neutral-850 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{ep.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {ep.method}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-neutral-400 truncate">{ep.path}</p>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">{ep.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeEndpoint.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {activeEndpoint.method}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">{activeEndpoint.description}</p>
              </div>

              <button
                onClick={() => runApiTest(activeEndpoint)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md shadow-emerald-950"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isLoading ? '请求中...' : '发起真实测试'}</span>
              </button>
            </div>

            {/* Request path & payload preview */}
            <div className="space-y-2 text-xs">
              <span className="text-neutral-400 font-medium">请求路径:</span>
              <div className="p-2.5 rounded-lg bg-black border border-neutral-800 font-mono text-emerald-400">
                {activeEndpoint.path}
                {activeEndpoint.paramsExample ? `?${activeEndpoint.paramsExample}` : ''}
              </div>

              {activeEndpoint.bodyExample && (
                <>
                  <span className="text-neutral-400 font-medium block mt-3">请求体 (JSON Body):</span>
                  <pre className="p-3 rounded-lg bg-black border border-neutral-800 font-mono text-amber-300 text-xs">
                    {JSON.stringify(activeEndpoint.bodyExample, null, 2)}
                  </pre>
                </>
              )}
            </div>

            {/* Test response viewer */}
            {testResponse && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-sky-400" />
                    真实接口响应 (HTTP {testResponse.httpStatus || 200})
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(testResponse.body, null, 2), 'response')}
                    className="text-xs text-sky-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'response' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>复制 JSON</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-black border border-neutral-800 text-sky-300 font-mono text-xs max-h-80 overflow-y-auto leading-relaxed">
                  {JSON.stringify(testResponse.body, null, 2)}
                </pre>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
