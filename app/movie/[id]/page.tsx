'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, 
  Star, 
  Film, 
  Layers, 
  ChevronRight, 
  Clock, 
  User, 
  Tv, 
  Bookmark, 
  Share2,
  Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail, ParsedPlaySource } from '@/types/maccms';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<NormalizedMovieDetail | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<NormalizedMovieDetail[]>([]);
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    let isCancelled = false;

    fetch(`/api/v1/movies/${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          if (data.success && data.data) {
            setMovie(data.data);
            setSelectedSourceIdx(0);
            
            // Check favorites in localStorage
            try {
              const favs = JSON.parse(localStorage.getItem('ruda_favorites') || '[]');
              setIsFavorited(favs.some((x: any) => String(x.id) === String(movieId)));
            } catch {}

            // Fetch related movies by same category
            if (data.data.typeId) {
              fetch(`/api/v1/movies?typeId=${data.data.typeId}&limit=8`)
                .then((r) => r.json())
                .then((relData) => {
                  if (!isCancelled && relData.success && relData.data?.list) {
                    setRelatedMovies(
                      relData.data.list.filter((m: NormalizedMovieDetail) => String(m.id) !== String(movieId)).slice(0, 6)
                    );
                  }
                })
                .catch(() => {});
            }
          } else {
            setError(data.message || '未找到该影片详情');
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || '获取影片详情失败');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [movieId]);

  const toggleFavorite = () => {
    if (!movie) return;
    try {
      const favs = JSON.parse(localStorage.getItem('ruda_favorites') || '[]');
      if (isFavorited) {
        const next = favs.filter((x: any) => String(x.id) !== String(movie.id));
        localStorage.setItem('ruda_favorites', JSON.stringify(next));
        setIsFavorited(false);
      } else {
        const favItem = {
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          year: movie.year,
          typeName: movie.typeName,
          score: movie.score,
          remarks: movie.remarks,
        };
        localStorage.setItem('ruda_favorites', JSON.stringify([favItem, ...favs]));
        setIsFavorited(true);
      }
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-pulse space-y-6">
          <div className="h-80 bg-[#111318] rounded-xl border border-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-64 bg-[#111318] rounded-xl border border-white/5" />
            <div className="md:col-span-3 h-64 bg-[#111318] rounded-xl border border-white/5" />
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#191B20] text-[#E50914] flex items-center justify-center border border-white/10">
            <Film className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">影片信息未能加载</h2>
          <p className="text-xs text-[#A1A1AA]">{error || '该影片可能暂无可用播放源'}</p>
          <Link
            href="/category"
            className="px-5 py-2.5 rounded-md bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-semibold transition"
          >
            返回片库浏览
          </Link>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const sources: ParsedPlaySource[] = movie.sources || [];
  const activeSource: ParsedPlaySource | undefined = sources[selectedSourceIdx] || sources[0];
  const episodes = activeSource?.episodes || [];
  const hasRealScore = movie.score && movie.score !== '0' && movie.score !== '0.0';

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 pb-24">
        
        {/* Large Cinematic Movie Backdrop with Netflix Fog Scrims */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[260px] max-h-[460px] overflow-hidden bg-[#000000]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-top opacity-30 filter blur-xs scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent w-full sm:w-2/3" />
        </div>

        {/* Content Container */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-56 relative z-10 space-y-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA]">
            <Link href="/" className="hover:text-white transition">首页</Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <Link href={`/category?typeId=${movie.typeId}`} className="hover:text-white transition">
              {movie.typeName || '影视'}
            </Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-white font-medium truncate max-w-xs">{movie.title}</span>
          </div>

          {/* Main Info Card */}
          <div className="flex flex-col sm:flex-row gap-5 lg:gap-8 items-start">
            
            {/* Left: 2:3 Cinematic Poster */}
            <div className="w-36 sm:w-48 md:w-56 shrink-0 mx-auto sm:mx-0 shadow-2xl rounded-lg overflow-hidden border border-white/10 bg-[#111318]">
              <div className="relative aspect-[2/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                {movie.remarks && (
                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-semibold text-white/90 border border-white/10">
                    {movie.remarks}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Metadata & Synopsis */}
            <div className="flex-1 space-y-3.5">
              
              {/* Unboxed Title & Badges */}
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] font-bold border border-[#E50914]/30">
                    {movie.typeName || '精选'}
                  </span>
                  {hasRealScore && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      豆瓣 {movie.score}
                    </span>
                  )}
                  {movie.year && (
                    <span className="text-[#A1A1AA] font-mono px-1.5 py-0.5 rounded bg-white/5">{movie.year}</span>
                  )}
                  <span className="text-[#A1A1AA] text-[9px] px-1.5 py-0.5 rounded border border-white/10">RUDAFLIX HD</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {movie.title}
                </h1>
              </div>

              {/* Detailed Apple CMS Fields: Year, Area, Lang, Director, Actors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-[11px] text-[#A1A1AA] bg-[#111318]/90 p-3 sm:p-3.5 rounded-lg border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 shrink-0 text-[10px]">地区:</span>
                  <span className="text-white">{movie.area || '未知'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 shrink-0 text-[10px]">语言:</span>
                  <span className="text-white">{movie.language || '国语 / 英语'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 shrink-0 text-[10px]">导演:</span>
                  <span className="text-white truncate">{movie.directors || movie.director || '名导力作'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 shrink-0 text-[10px]">年份:</span>
                  <span className="text-white">{movie.year || '2026'}</span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-2">
                  <span className="text-white/40 shrink-0 pt-0.5 text-[10px]">主演:</span>
                  <span className="text-white line-clamp-1">{movie.actors || movie.actor || '全明星阵容'}</span>
                </div>
              </div>

              {/* Action Buttons: Red Play Button & Secondary Actions */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  href={`/watch/${movie.id}?source=${selectedSourceIdx}&ep=0`}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold shadow-lg shadow-[#E50914]/30 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>立即播放</span>
                </Link>

                <button
                  onClick={toggleFavorite}
                  className={`flex items-center gap-1 px-3.5 py-2.5 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                    isFavorited
                      ? 'bg-white/20 text-[#E50914] border-[#E50914]/40'
                      : 'bg-[#191B20] text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                  <span>{isFavorited ? '已在片单' : '加入片单'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-md bg-[#191B20] text-white border border-white/10 hover:bg-white/10 text-[11px] font-medium transition cursor-pointer"
                  title="分享影片"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>分享</span>
                    </>
                  )}
                </button>
              </div>

              {/* Synopsis */}
              {movie.description && (
                <div className="space-y-1 pt-1.5">
                  <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">剧情梗概</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-4">
                    {movie.description.replace(/<[^>]+>/g, '')}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Episode List & Play Sources (for Series & Multi-source Movies) */}
          {episodes.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#111318] rounded-xl border border-white/[0.06] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#E50914]" />
                  <h3 className="text-sm font-bold text-white">选集播放</h3>
                  <span className="text-[10px] text-[#A1A1AA]">(共 {episodes.length} 集)</span>
                </div>

                {/* Multiple Source Switcher */}
                {sources.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] text-[#A1A1AA] mr-1 shrink-0">线路:</span>
                    {sources.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSourceIdx(idx)}
                        className={`px-2.5 py-0.5 rounded text-[10px] transition cursor-pointer whitespace-nowrap ${
                          idx === selectedSourceIdx
                            ? 'bg-[#E50914] text-white font-bold'
                            : 'bg-[#191B20] text-[#A1A1AA] hover:text-white border border-white/5'
                        }`}
                      >
                        {s.sourceName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episode Grid with compact typography */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-72 overflow-y-auto no-scrollbar py-1">
                {episodes.map((ep, idx) => (
                  <Link
                    key={idx}
                    href={`/watch/${movie.id}?source=${selectedSourceIdx}&ep=${idx}`}
                    className="py-2 px-1 rounded-md bg-[#191B20] hover:bg-[#E50914] hover:text-white border border-white/[0.06] hover:border-[#E50914] text-[10px] font-medium text-white/90 text-center transition truncate group"
                  >
                    <span className="truncate">{ep.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Recommendations */}
          {relatedMovies.length > 0 && (
            <div className="space-y-3.5 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#E50914] rounded-full" />
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">猜你喜欢 · 同类精彩</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
                {relatedMovies.map((rel) => (
                  <MovieCard key={rel.id} movie={rel} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
