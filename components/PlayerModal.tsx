'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tv, 
  Film, 
  Layers, 
  Check, 
  Copy, 
  Code2, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { NormalizedMovieDetail, ParsedPlaySource } from '@/types/maccms';
import { PlaybackData, ApiResponse } from '@/types/parser';
import { getCurrentTimestamp } from '@/lib/utils';

interface PlayerModalProps {
  movie: NormalizedMovieDetail | null;
  onClose: () => void;
}

export default function PlayerModal({ movie, onClose }: PlayerModalProps) {
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [resolveResult, setResolveResult] = useState<PlaybackData | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [resolveLatency, setResolveLatency] = useState<number>(0);

  const doResolve = async (movieId: string | number, sourceIdx: number, epIdx: number) => {
    setIsResolving(true);
    setResolveError(null);
    const start = getCurrentTimestamp();

    try {
      const res = await fetch('/api/v1/play/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          sourceIndex: sourceIdx,
          episodeIndex: epIdx,
        }),
      });

      const json: ApiResponse<PlaybackData> = await res.json();
      setResolveLatency(getCurrentTimestamp() - start);

      if (json.success && json.data) {
        setResolveResult(json.data);
      } else {
        setResolveError(json.message || '播放解析失败');
        if (json.data) {
          setResolveResult(json.data);
        }
      }
    } catch (err: any) {
      setResolveError(err.message || '网络请求错误');
    } finally {
      setIsResolving(false);
    }
  };

  // When movie changes, reset selections and resolve first episode
  useEffect(() => {
    if (movie && movie.sources && movie.sources.length > 0) {
      const timer = setTimeout(() => {
        doResolve(movie.id, 0, 0);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [movie]);

  const handleSourceChange = (newSourceIdx: number) => {
    if (!movie) return;
    setSelectedSourceIndex(newSourceIdx);
    // Keep episode index if valid, else clamp to 0
    const source = movie.sources[newSourceIdx];
    const newEpIdx = source?.episodes && source.episodes[selectedEpisodeIndex] ? selectedEpisodeIndex : 0;
    setSelectedEpisodeIndex(newEpIdx);
    doResolve(movie.id, newSourceIdx, newEpIdx);
  };

  const handleEpisodeChange = (newEpIdx: number) => {
    if (!movie) return;
    setSelectedEpisodeIndex(newEpIdx);
    doResolve(movie.id, selectedSourceIndex, newEpIdx);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!movie) return null;

  const currentSource: ParsedPlaySource | undefined = movie.sources[selectedSourceIndex] || movie.sources[0];
  const episodes = currentSource?.episodes || [];
  const currentEp = episodes[selectedEpisodeIndex] || episodes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Film className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {movie.title}
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-normal">
                  {movie.year || '2026'} · {movie.typeName}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                {movie.area} · 导演: {movie.directors || '未知'} · 主演: {movie.actors || '未知'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonRaw(!showJsonRaw)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showJsonRaw ? '隐藏 JSON' : '查看 JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Anti-Gambling & Ad Clean Assurance Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">AI 防博彩纯净引擎已生效</span>
              <span className="text-neutral-400 hidden sm:inline">| 已自动屏蔽赌博弹窗、荷官贴片切片与水印</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
              100% 纯净直连
            </span>
          </div>

          {/* Main Video Player */}
          {resolveResult?.url ? (
            <CustomVideoPlayer
              url={resolveResult.cleanProxyUrl || resolveResult.url}
              type={resolveResult.type || 'hls'}
              movieTitle={movie.title}
              episodeName={currentEp?.name || '正片'}
              sourceName={currentSource?.sourceName || '主线路'}
              fallbackAvailable={resolveResult.fallbackAvailable}
              onSwitchFallback={() => {
                if (resolveResult.alternativeSources && resolveResult.alternativeSources.length > 0) {
                  handleSourceChange(resolveResult.alternativeSources[0].sourceIndex);
                }
              }}
              onRetry={() => doResolve(movie.id, selectedSourceIndex, selectedEpisodeIndex)}
            />
          ) : (
            <div className="aspect-video w-full bg-neutral-950 rounded-xl flex flex-col items-center justify-center border border-neutral-800 p-6 text-center">
              {isResolving ? (
                <>
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-medium text-neutral-300">正在通过 AI 纯净引擎加载流媒体...</p>
                  <p className="text-xs text-neutral-500 mt-1">自动识别并剔除博彩广告切片</p>
                </>
              ) : (
                <>
                  <Info className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-sm text-neutral-300 font-medium">{resolveError || '解析当前线路失败'}</p>
                  <p className="text-xs text-neutral-500 mt-1">请尝试在下方点击切换其他播放源或剧集</p>
                </>
              )}
            </div>
          )}

          {/* Source lines switching */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-neutral-200">纯净播放线路选择</h4>
                <span className="text-xs text-neutral-400">({movie.sources.length} 条可用源)</span>
              </div>
              <span className="text-xs text-emerald-400">系统已自动置顶无广告专线</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.sources.map((src, idx) => {
                const isActive = idx === selectedSourceIndex;
                const isTopPick = idx === 0;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSourceChange(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      isActive 
                        ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-900/30' 
                        : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                    <span>{src.sourceName}</span>
                    {isTopPick && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        智能优选
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Episode selection */}
          {episodes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-semibold text-neutral-200">剧集选择 (严格对应当前线路)</h4>
                  <span className="text-xs text-neutral-400">(共 {episodes.length} 集)</span>
                </div>
                {resolveLatency > 0 && (
                  <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    解析耗时: {resolveLatency}ms
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
                {episodes.map((ep, idx) => {
                  const isActive = idx === selectedEpisodeIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleEpisodeChange(idx)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer truncate text-center border ${
                        isActive 
                          ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-900/30' 
                          : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/50 hover:bg-neutral-700 hover:text-white'
                      }`}
                      title={ep.name}
                    >
                      {ep.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resolved URL details */}
          {resolveResult && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  独立 API 标准化流地址:
                </span>
                <button
                  onClick={() => handleCopyUrl(resolveResult.url)}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? '已复制' : '复制直链'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-neutral-300 bg-neutral-900 p-2.5 rounded-lg break-all border border-neutral-800">
                {resolveResult.url}
              </p>
            </div>
          )}

          {/* Raw JSON Debug inspector */}
          {showJsonRaw && resolveResult && (
            <div className="space-y-1">
              <span className="text-xs font-mono text-neutral-400">/api/v1/play/resolve 真实 JSON 响应:</span>
              <pre className="p-4 rounded-xl bg-black border border-neutral-800 text-emerald-400 text-xs font-mono overflow-x-auto">
                {JSON.stringify({
                  code: 200,
                  success: true,
                  message: 'success',
                  data: resolveResult,
                }, null, 2)}
              </pre>
            </div>
          )}

          {/* Movie Description */}
          {movie.description && (
            <div className="pt-2 border-t border-neutral-800">
              <h5 className="text-xs font-semibold text-neutral-400 mb-1">剧情简介:</h5>
              <p className="text-xs leading-relaxed text-neutral-300">{movie.description}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
