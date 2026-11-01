'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layers, 
  Tv, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  RotateCcw,
  Play,
  Bookmark,
  Share2,
  Check,
  Star,
  ArrowUpDown,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import MovieCard from './MovieCard';
import { NormalizedMovieDetail, ParsedPlaySource, ParsedEpisode } from '@/types/maccms';
import { PlaybackData, ApiResponse } from '@/types/parser';

interface WatchPlayerProps {
  movie: NormalizedMovieDetail;
  initialSourceIndex?: number;
  initialEpisodeIndex?: number;
  relatedMovies?: NormalizedMovieDetail[];
}

export default function WatchPlayer({
  movie,
  initialSourceIndex = 0,
  initialEpisodeIndex = 0,
  relatedMovies = [],
}: WatchPlayerProps) {
  const router = useRouter();

  const [sourceIndex, setSourceIndex] = useState(initialSourceIndex);
  const [episodeIndex, setEpisodeIndex] = useState(initialEpisodeIndex);
  const [resolveResult, setResolveResult] = useState<PlaybackData | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'episodes' | 'details' | 'related'>('episodes');
  const [isFavorited, setIsFavorited] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const favs = JSON.parse(localStorage.getItem('ruda_favorites') || '[]');
      return favs.some((x: any) => String(x.id) === String(movie.id));
    } catch {
      return false;
    }
  });
  const [copiedShare, setCopiedShare] = useState(false);
  const [isAscending, setIsAscending] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const sources = movie.sources || [];
  const currentSource: ParsedPlaySource | undefined = sources[sourceIndex] || sources[0];
  const episodes: ParsedEpisode[] = currentSource?.episodes || [];
  const currentEpisode: ParsedEpisode | undefined = episodes[episodeIndex] || episodes[0];

  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    queueMicrotask(() => {
      if (!isCancelled) {
        setIsResolving(true);
        setResolveError(null);
      }
    });

    async function executeResolve() {
      try {
        const res = await fetch('/api/v1/play/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId: movie.id,
            sourceIndex,
            episodeIndex,
          }),
        });

        const json: ApiResponse<PlaybackData> = await res.json();
        if (!isCancelled) {
          if (json.success && json.data) {
            setResolveResult(json.data);

            try {
              const item = {
                movieId: movie.id,
                movieTitle: movie.title,
                poster: movie.poster,
                sourceIndex,
                episodeIndex,
                episodeName: currentEpisode?.name || '第 1 集',
                sourceName: currentSource?.sourceName || '播放线路',
                timestamp: Date.now(),
              };
              const raw = localStorage.getItem('ruda_watch_history');
              const list = raw ? JSON.parse(raw) : [];
              const updated = [item, ...list.filter((x: any) => String(x.movieId) !== String(movie.id))].slice(0, 25);
              localStorage.setItem('ruda_watch_history', JSON.stringify(updated));
            } catch {}
          } else {
            setResolveError(json.message || '播放解析失败');
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setResolveError(err.message || '网络连接错误');
        }
      } finally {
        if (!isCancelled) {
          setIsResolving(false);
        }
      }
    }

    executeResolve();

    return () => {
      isCancelled = true;
    };
  }, [movie.id, movie.title, movie.poster, sourceIndex, episodeIndex, retryKey, currentEpisode?.name, currentSource?.sourceName]);

  const handleSourceChange = (newSourceIdx: number) => {
    setSourceIndex(newSourceIdx);
    const newSource = sources[newSourceIdx];
    const newEpIdx = newSource?.episodes && newSource.episodes[episodeIndex] ? episodeIndex : 0;
    setEpisodeIndex(newEpIdx);
  };

  const handleEpisodeChange = (newEpIdx: number) => {
    setEpisodeIndex(newEpIdx);
    setShowDrawer(false);
  };

  const toggleFavorite = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('ruda_favorites') || '[]');
      if (isFavorited) {
        const next = favs.filter((x: any) => String(x.id) !== String(movie.id));
        localStorage.setItem('ruda_favorites', JSON.stringify(next));
        setIsFavorited(false);
      } else {
        const item = {
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          year: movie.year,
          typeName: movie.typeName,
          score: movie.score,
          remarks: movie.remarks,
        };
        localStorage.setItem('ruda_favorites', JSON.stringify([item, ...favs]));
        setIsFavorited(true);
      }
    } catch {}
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    }
  };

  const handleNextEpisode = () => {
    if (episodeIndex < episodes.length - 1) {
      setEpisodeIndex(episodeIndex + 1);
    }
  };

  // Sorting episodes
  const displayEpisodes = isAscending ? episodes : [...episodes].reverse();

  return (
    <div className="space-y-6">
      
      {/* 1. Core Netflix Cinema Video Player Frame */}
      <div className="w-full max-w-[1600px] mx-auto">
        {resolveResult?.url ? (
          <CustomVideoPlayer
            url={resolveResult.cleanProxyUrl || resolveResult.url}
            type={resolveResult.type || 'hls'}
            movieId={movie.id}
            movieTitle={movie.title}
            episodeName={currentEpisode?.name || '正片'}
            sourceName={currentSource?.sourceName || '播放专线'}
            totalEpisodes={episodes.length}
            currentEpisodeIndex={episodeIndex}
            fallbackAvailable={resolveResult.fallbackAvailable}
            onSwitchFallback={() => {
              if (resolveResult.alternativeSources && resolveResult.alternativeSources.length > 0) {
                handleSourceChange(resolveResult.alternativeSources[0].sourceIndex);
              }
            }}
            onRetry={() => setRetryKey((k) => k + 1)}
            onNextEpisode={handleNextEpisode}
            onOpenEpisodesDrawer={() => setShowDrawer(true)}
          />
        ) : (
          <div className="aspect-video w-full bg-[#000000] rounded-xl flex flex-col items-center justify-center border border-white/10 p-6 text-center">
            {isResolving ? (
              <>
                <div className="w-12 h-12 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-semibold text-white">正在解析极清流媒体视频源...</p>
              </>
            ) : (
              <>
                <Info className="w-10 h-10 text-[#E50914] mb-2" />
                <p className="text-sm text-white font-medium">{resolveError || '解析当前线路失败'}</p>
                <p className="text-xs text-[#A1A1AA] mt-1">请尝试在下方点击切换其他播放线路或备用剧集</p>
                <button
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="mt-4 px-4 py-2 rounded-md bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重新加载</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. Movie Header Info Block (Directly matching Reference Image 1 / image_f6673b04.png) */}
      <div className="space-y-4">
        <div className="flex gap-4 sm:gap-6 items-start">
          {/* Poster Card */}
          <div className="w-20 sm:w-28 aspect-[2/3] rounded-md overflow-hidden bg-[#181818] border border-white/10 shrink-0 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
              {movie.score && movie.score !== '0' && (
                <span className="text-[#E50914] font-bold flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {movie.score}
                </span>
              )}
              <span>{movie.year || '2026'}</span>
              <span>·</span>
              <span>{movie.area || '中国大陆'}</span>
              <span>·</span>
              <span>{movie.typeName}</span>
            </div>
          </div>
        </div>

        {/* 3 Action Buttons (Reference Image 1: 继续播放, 收藏, 分享) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Red Wide Button: 继续播放 / 立即播放 */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-[#E50914] hover:bg-[#B80710] text-white text-sm font-bold shadow-lg shadow-[#E50914]/30 transition cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>继续播放</span>
          </button>

          {/* Favorite */}
          <button
            onClick={toggleFavorite}
            className={`flex items-center justify-center gap-2 py-3 rounded-full bg-[#181818] hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium transition cursor-pointer ${
              isFavorited ? 'text-[#E50914] border-[#E50914]/40' : 'text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            <span>{isFavorited ? '已在片单' : '+ 收藏'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-[#181818] hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium text-white transition cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">已复制链接</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>分享</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Three Tabs (Reference Image 1: 选集, 详情, 相关推荐) */}
      <div className="border-b border-white/10 pt-2">
        <div className="flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`pb-3 relative transition cursor-pointer ${
              activeTab === 'episodes' ? 'text-white font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <span>选集</span>
            {activeTab === 'episodes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 relative transition cursor-pointer ${
              activeTab === 'details' ? 'text-white font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <span>详情</span>
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('related')}
            className={`pb-3 relative transition cursor-pointer ${
              activeTab === 'related' ? 'text-white font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <span>相关推荐</span>
            {activeTab === 'related' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />
            )}
          </button>
        </div>
      </div>

      {/* 4. Tab 1: 选集 (Reference Image 1: 全部剧集, 正序, 横向卡片流) */}
      {activeTab === 'episodes' && (
        <div className="space-y-4 pt-1">
          {/* Header row: 全部剧集 (1-X集) + 排序 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">全部剧集</span>
              <span className="text-[#A1A1AA]">
                ({episodes.length > 0 ? `1-${episodes.length}集` : '正片'})
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Multi-source switcher if available */}
              {sources.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#A1A1AA]">线路:</span>
                  <select
                    value={sourceIndex}
                    onChange={(e) => handleSourceChange(Number(e.target.value))}
                    className="bg-[#181818] text-white border border-white/10 rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
                  >
                    {sources.map((s, idx) => (
                      <option key={idx} value={idx}>
                        {s.sourceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Order toggle */}
              <button
                onClick={() => setIsAscending(!isAscending)}
                className="flex items-center gap-1 text-[#A1A1AA] hover:text-white transition cursor-pointer"
              >
                <span>{isAscending ? '正序' : '倒序'}</span>
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Episode Cards Grid / Track (Matching Reference Image 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displayEpisodes.map((ep) => {
              const actualIdx = episodes.findIndex((x) => x.name === ep.name);
              const isActive = actualIdx === episodeIndex;
              return (
                <button
                  key={ep.name}
                  onClick={() => handleEpisodeChange(actualIdx)}
                  className={`group relative text-left rounded-lg overflow-hidden border transition cursor-pointer block ${
                    isActive
                      ? 'border-[#E50914] ring-1 ring-[#E50914] bg-[#181818]'
                      : 'border-white/10 hover:border-white/30 bg-[#111318]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-[#181818] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.poster}
                      alt={ep.name}
                      className="w-full h-full object-cover object-top opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* "正在播放" Red Badge (Matching Reference Image 1) */}
                    {isActive && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-bold">
                        正在播放
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
                      <span className="font-semibold truncate">{ep.name}</span>
                    </div>
                  </div>

                  <div className="p-2 text-[11px] text-[#A1A1AA] flex items-center justify-between">
                    <span className="truncate">{movie.title}</span>
                    <span className="text-white/40">HD</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tab 2: 详情 */}
      {activeTab === 'details' && (
        <div className="p-5 bg-[#111318] rounded-xl border border-white/5 space-y-4 text-xs text-[#A1A1AA]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-white/40">导演: </span>
              <span className="text-white">{movie.directors || movie.director || '暂无'}</span>
            </div>
            <div>
              <span className="text-white/40">主演: </span>
              <span className="text-white">{movie.actors || movie.actor || '暂无'}</span>
            </div>
            <div>
              <span className="text-white/40">类型: </span>
              <span className="text-white">{movie.typeName}</span>
            </div>
            <div>
              <span className="text-white/40">语言: </span>
              <span className="text-white">{movie.language || '国语 / 原声'}</span>
            </div>
            <div>
              <span className="text-white/40">地区: </span>
              <span className="text-white">{movie.area || '中国大陆'}</span>
            </div>
            <div>
              <span className="text-white/40">上映: </span>
              <span className="text-white">{movie.year || '2026'}</span>
            </div>
          </div>

          {movie.description && (
            <div className="pt-2.5 border-t border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                  <span className="w-1 h-3 bg-[#E50914] rounded-full" />
                  剧情简介
                </h4>
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="flex items-center gap-1 text-[11px] text-[#E50914] hover:text-[#ff3b47] transition cursor-pointer font-medium"
                >
                  <span>{isDescExpanded ? '收起简介' : '展开简介'}</span>
                  {isDescExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className={`text-xs leading-relaxed text-[#A1A1AA] transition-all duration-300 ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                {movie.description.replace(/<[^>]+>/g, '')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: 相关推荐 */}
      {activeTab === 'related' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 pt-1">
          {relatedMovies.map((rel) => (
            <MovieCard key={rel.id} movie={rel} />
          ))}
        </div>
      )}

      {/* 7. Slide-over Episodes Drawer (When user clicks "选集" from player) */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111318] h-full p-5 space-y-4 overflow-y-auto border-l border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">剧集选集</h3>
                <p className="text-xs text-[#A1A1AA]">{movie.title} (共 {episodes.length} 集)</p>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-white/50 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {episodes.map((ep, idx) => {
                const isActive = idx === episodeIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => handleEpisodeChange(idx)}
                    className={`p-3 rounded-lg text-xs font-semibold text-center transition cursor-pointer truncate ${
                      isActive
                        ? 'bg-[#E50914] text-white shadow-lg'
                        : 'bg-[#181818] text-[#A1A1AA] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {ep.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
