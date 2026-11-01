'use client';

import React, { useState } from 'react';
import { 
  Server, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Tv, 
  FileJson, 
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { parsePlaySources } from '@/server/maccms/maccmsParser';
import { ParsedPlaySource } from '@/types/maccms';
import { getCurrentTimestamp } from '@/lib/utils';

export default function CmsTester() {
  const [acType, setAcType] = useState<'list' | 'videolist' | 'detail'>('videolist');
  const [page, setPage] = useState('1');
  const [typeId, setTypeId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [ids, setIds] = useState('1001');
  const [isLoading, setIsLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [selectedInspectItem, setSelectedInspectItem] = useState<any>(null);
  const [inspectSources, setInspectSources] = useState<ParsedPlaySource[]>([]);

  // Raw parser playground
  const [testRawFrom, setTestRawFrom] = useState('kkm3u8$$$ffm3u8$$$mp4');
  const [testRawUrl, setTestRawUrl] = useState(
    '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第02集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
    '$$$' +
    '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第02集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
    '$$$' +
    'MP4原画$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );
  const [playgroundParsed, setPlaygroundParsed] = useState<ParsedPlaySource[]>([]);

  const runPlaygroundParse = () => {
    const res = parsePlaySources(testRawFrom, testRawUrl);
    setPlaygroundParsed(res);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseJson(null);
    setSelectedInspectItem(null);
    const start = getCurrentTimestamp();

    try {
      const params = new URLSearchParams();
      params.set('ac', acType);
      if (page) params.set('pg', page);
      if (typeId) params.set('t', typeId);
      if (keyword) params.set('wd', keyword);
      if (acType === 'detail' && ids) params.set('ids', ids);

      const res = await fetch(`/api/provide/vod?${params.toString()}`);
      const data = await res.json();
      setResponseLatency(getCurrentTimestamp() - start);
      setResponseJson(data);

      if (data.list && data.list.length > 0) {
        inspectItem(data.list[0]);
      }
    } catch (e: any) {
      setResponseJson({ error: e.message });
      setResponseLatency(getCurrentTimestamp() - start);
    } finally {
      setIsLoading(false);
    }
  };

  const inspectItem = (item: any) => {
    setSelectedInspectItem(item);
    const parsed = parsePlaySources(
      item.vod_play_from,
      item.vod_play_url,
      item.vod_play_server,
      item.vod_play_note
    );
    setInspectSources(parsed);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Server className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">MacCMS V10 Provide 接口实时联调</h2>
            <p className="text-xs text-neutral-400">
              严格规范对接标准 /api.php/provide/vod/ 协议 · 验证 ac=list / videolist / detail · 校验 $$$、#、$ 规则
            </p>
          </div>
        </div>
      </div>

      {/* Query Control Bar */}
      <div className="p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Action parameter */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              接口动作 (ac)
            </label>
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              {(['videolist', 'list', 'detail'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAcType(mode)}
                  className={`py-1.5 text-xs font-mono rounded-lg transition cursor-pointer ${
                    acType === mode 
                      ? 'bg-sky-600 text-white font-bold shadow' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Page */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              分页 (pg)
            </label>
            <input
              type="number"
              min="1"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Type ID */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              分类 ID (t) - 可选
            </label>
            <input
              type="text"
              placeholder="例如: 1 (电影), 2 (连续剧)"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Keyword or IDs */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              {acType === 'detail' ? '指定影片 IDs (ids)' : '搜索关键词 (wd)'}
            </label>
            <input
              type="text"
              placeholder={acType === 'detail' ? '1001, 1002' : '如: 大雄兔, 辛特尔'}
              value={acType === 'detail' ? ids : keyword}
              onChange={(e) => acType === 'detail' ? setIds(e.target.value) : setKeyword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

        </div>

        {/* Send Button */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <div className="text-xs text-neutral-400 font-mono">
            GET /api/provide/vod?ac={acType}&pg={page}
            {typeId ? `&t=${typeId}` : ''}
            {keyword ? `&wd=${encodeURIComponent(keyword)}` : ''}
            {acType === 'detail' && ids ? `&ids=${ids}` : ''}
          </div>
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-sky-950"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>发起 MacCMS 联调请求</span>
          </button>
        </div>
      </div>

      {/* Query Result Section */}
      {responseJson && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Raw JSON View */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-sky-400" />
                MacCMS 原始返回 JSON
              </span>
              {responseLatency !== null && (
                <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  耗时: {responseLatency}ms
                </span>
              )}
            </div>

            <pre className="p-4 rounded-xl bg-black border border-neutral-800 text-sky-300 text-xs font-mono max-h-96 overflow-y-auto leading-relaxed">
              {JSON.stringify(responseJson, null, 2)}
            </pre>

            {/* List selector if videolist or list */}
            {responseJson.list && responseJson.list.length > 0 && (
              <div>
                <span className="text-xs text-neutral-400 mb-1.5 block">点击选取影片进行结构化匹配分析:</span>
                <div className="flex flex-wrap gap-1.5">
                  {responseJson.list.map((it: any) => (
                    <button
                      key={it.vod_id}
                      onClick={() => inspectItem(it)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        selectedInspectItem?.vod_id === it.vod_id
                          ? 'bg-sky-500 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {it.vod_name} (ID: {it.vod_id})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Structure & Parsing Analysis */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              多线路与多剧集严格匹配结果 (校验 $$$ / # / $)
            </span>

            {selectedInspectItem ? (
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedInspectItem.vod_name}</h4>
                  <p className="text-neutral-400 mt-0.5">
                    分类: {selectedInspectItem.type_name} · 备注: {selectedInspectItem.vod_remarks || '无'}
                  </p>
                </div>

                {/* Raw fields breakdown */}
                <div className="space-y-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px]">
                  <div>
                    <span className="text-neutral-500">vod_play_from ($$$ 分割):</span>
                    <p className="text-amber-400 break-all">{selectedInspectItem.vod_play_from || '(空)'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">vod_play_url (分组 $$$、集数 #、分段 $):</span>
                    <p className="text-emerald-400 break-all max-h-24 overflow-y-auto">
                      {selectedInspectItem.vod_play_url || '(空)'}
                    </p>
                  </div>
                </div>

                {/* Parsed lines */}
                <div className="space-y-3">
                  <span className="font-semibold text-neutral-200">
                    解析结果 ({inspectSources.length} 条独立线路, 零丢失匹配):
                  </span>
                  {inspectSources.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          线路 {idx + 1}: {s.sourceName} ({s.sourceCode})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px]">
                          {s.episodes.length} 集
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                        {s.episodes.slice(0, 8).map((ep, eIdx) => (
                          <div 
                            key={eIdx}
                            className="p-1.5 bg-neutral-900 rounded border border-neutral-800 text-[11px] truncate text-neutral-300"
                            title={ep.rawUrl}
                          >
                            <span className="font-medium text-emerald-400">{ep.name}: </span>
                            <span className="text-neutral-500">{ep.format.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                      {s.episodes.length > 8 && (
                        <p className="text-[10px] text-neutral-500">...以及其余 {s.episodes.length - 8} 集</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-500 text-xs">
                发起查询后将自动在此处展示结构化解析详情
              </div>
            )}
          </div>

        </div>
      )}

      {/* Parser Playground Tool */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Settings className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">自测实验室：MacCMS 原始字符串解析器</h3>
          </div>
          <button
            onClick={runPlaygroundParse}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            立即执行解析测试
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              测试 vod_play_from (以 $$$ 隔开各线路)
            </label>
            <input
              type="text"
              value={testRawFrom}
              onChange={(e) => setTestRawFrom(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              测试 vod_play_url (以 $$$ 隔开线路，# 隔开集数，集名$URL)
            </label>
            <input
              type="text"
              value={testRawUrl}
              onChange={(e) => setTestRawUrl(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {playgroundParsed.length > 0 && (
          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
            <span className="text-xs font-semibold text-neutral-300">
              实验室解析成功 ({playgroundParsed.length} 条线路)：
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {playgroundParsed.map((p, idx) => (
                <div key={idx} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-sky-400">
                    <span>{p.sourceName}</span>
                    <span className="text-neutral-400">{p.episodes.length} 集</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-neutral-300 max-h-32 overflow-y-auto">
                    {p.episodes.map((ep, eIdx) => (
                      <div key={eIdx} className="truncate">
                        <span className="text-emerald-400">{ep.name}: </span>
                        <span className="text-neutral-400">{ep.rawUrl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
