'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Film, 
  Play, 
  Layers, 
  Sparkles, 
  Tv, 
  RefreshCw,
  Star,
  CheckCircle2
} from 'lucide-react';
import { NormalizedMovieDetail, MacCmsCategory } from '@/types/maccms';
import PlayerModal from './PlayerModal';

export default function MovieExplorer() {
  const [movies, setMovies] = useState<NormalizedMovieDetail[]>([]);
  const [categories, setCategories] = useState<MacCmsCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeMovie, setActiveMovie] = useState<NormalizedMovieDetail | null>(null);
  const [isRemoteSource, setIsRemoteSource] = useState(false);

  const fetchMovies = async (catId?: number | null, keyword?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (catId) params.set('typeId', String(catId));
      if (keyword && keyword.trim()) params.set('keyword', keyword.trim());

      const res = await fetch(`/api/v1/movies?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMovies(data.data.list || []);
        setIsRemoteSource(data.data.isRemote);
      }
    } catch (e) {
      console.error('加载影片失败', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and movies on mount
  useEffect(() => {
    let isMounted = true;

    fetch('/api/v1/categories')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(console.error);

    fetch('/api/v1/movies')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data) {
          setMovies(data.data.list || []);
          setIsRemoteSource(data.data.isRemote);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryClick = (catId: number | null) => {
    setSelectedCategoryId(catId);
    fetchMovies(catId, searchKeyword);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovies(selectedCategoryId, searchKeyword);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Filter Controls */}
      <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Film className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">影视点播与独立播放</h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已开启无广告极速解析
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              基于 MacCMS V10 标准 Provide 协议对接 · 支持多线路切换 · 自动多剧集解析 · 原生 HLS/MP4 直连
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索电影、电视剧、演员或导演..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-750 rounded-xl pl-9 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-emerald-950"
            >
              搜索
            </button>
            {(searchKeyword || selectedCategoryId !== null) && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedCategoryId(null);
                  fetchMovies(null, '');
                }}
                className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-xl transition cursor-pointer"
                title="重置筛选"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            全部影片
          </button>
          {categories.map((cat) => (
            <button
              key={cat.type_id}
              onClick={() => handleCategoryClick(cat.type_id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategoryId === cat.type_id
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.type_name}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-neutral-900 rounded-xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-300">未检索到匹配影片</h3>
          <p className="text-xs text-neutral-500 mt-1">请尝试更换搜索关键词或选择不同分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setActiveMovie(movie)}
              className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex flex-col"
            >
              {/* Poster container */}
              <div className="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Score badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[11px] font-bold text-amber-400 flex items-center gap-0.5 border border-amber-500/30">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{movie.score || '8.8'}</span>
                </div>

                {/* Remarks badge (bottom left of poster) */}
                {movie.remarks && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] text-emerald-300 font-medium border border-emerald-500/30">
                    {movie.remarks}
                  </div>
                )}

                {/* Hover Play Button */}
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & metadata */}
              <div className="p-3 flex-1 flex flex-col justify-between bg-neutral-900/90">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                    <span>{movie.year || '2026'}</span>
                    <span>·</span>
                    <span>{movie.typeName}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Layers className="w-3 h-3" />
                    <span>{movie.sources.length} 条线路</span>
                  </span>
                  <span className="text-neutral-500">
                    {movie.sources[0]?.episodes?.length ? `${movie.sources[0].episodes.length} 集` : '单片'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Playback Modal */}
      {activeMovie && (
        <PlayerModal
          movie={activeMovie}
          onClose={() => setActiveMovie(null)}
        />
      )}
    </div>
  );
}
