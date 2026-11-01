'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Film, Star, ChevronRight, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || searchParams.get('keyword') || '';

  const [keyword, setKeyword] = useState(queryParam);
  const [results, setResults] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hotQueries = ['大雄兔', '钢铁之泪', '星际征途', '科幻', '动作', '动画', '悬疑'];

  useEffect(() => {
    let isCancelled = false;

    if (!queryParam.trim()) {
      return;
    }

    fetch(`/api/v1/movies?keyword=${encodeURIComponent(queryParam.trim())}&limit=40`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data?.list) {
          setResults(data.data.list);
        } else if (!isCancelled) {
          setResults([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setResults([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">全网搜索</span>
        </div>

        {/* Large Netflix Search Bar */}
        <div className="max-w-2xl mx-auto space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 text-[#A1A1AA] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索电影、电视剧、动漫、演员、导演..."
              className="w-full bg-[#111318] border border-white/10 rounded-xl py-3 pl-12 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E50914] transition shadow-lg"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 p-1 text-white/50 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Hot Search Tags */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-[#A1A1AA] shrink-0">大家都在搜:</span>
            {hotQueries.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setKeyword(q);
                  router.push(`/search?q=${encodeURIComponent(q)}`);
                }}
                className="px-2.5 py-1 rounded bg-[#191B20] hover:bg-white/10 text-white/80 transition whitespace-nowrap cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Section */}
        {queryParam ? (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white">
                “{queryParam}” 的搜索结果
              </h2>
              <span className="text-xs text-[#A1A1AA]">共找到 {results.length} 部影片</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-md bg-[#111318] animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 bg-[#111318] rounded-xl border border-white/5 max-w-md mx-auto">
                <Film className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-sm font-semibold text-white">未找到与 “{queryParam}” 相关的影视</p>
                <p className="text-xs text-[#A1A1AA]">请检查关键词是否有错别字，或尝试搜索其他片名</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2 text-[#A1A1AA]">
            <Film className="w-12 h-12 mx-auto text-white/20 mb-3" />
            <p className="text-sm">输入影视名称、主演、年份或题材探索海量影视库</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090B]" />}>
      <SearchContent />
    </Suspense>
  );
}
