'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import MovieCard from '@/components/MovieCard';
import MovieRow from '@/components/MovieRow';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';
import { Film, Filter, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MovieChannelPage() {
  const [movies, setMovies] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubGenre, setSelectedSubGenre] = useState<string>('全部');

  useEffect(() => {
    let isCancelled = false;
    // Type 1 is Movie in MacCMS
    fetch('/api/v1/movies?typeId=1&limit=40')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data?.list) {
          setMovies(data.data.list);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const heroMovie = movies.length > 0 ? movies[0] : null;

  const subGenres = ['全部', '动作片', '科幻片', '喜剧片', '爱情片', '悬疑片'];

  const filteredMovies = useMemo(() => {
    if (selectedSubGenre === '全部') return movies;
    return movies.filter((m) => 
      m.typeName?.includes(selectedSubGenre.replace('片', '')) ||
      m.description?.includes(selectedSubGenre.replace('片', ''))
    );
  }, [movies, selectedSubGenre]);

  const topRated = useMemo(() => {
    return [...movies].sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0')).slice(0, 8);
  }, [movies]);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-24 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">电影频道</span>
        </div>

        {/* Hero */}
        {isLoading ? (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] min-h-[260px] max-h-[460px] rounded-xl bg-[#111318] animate-pulse border border-white/5" />
        ) : (
          heroMovie && <HeroBanner movie={heroMovie} />
        )}

        {/* Top Rated Row */}
        {topRated.length > 0 && (
          <MovieRow title="高分院线大片" movies={topRated} badge="8.0+ 推荐" />
        )}

        {/* Sub-genre Selector & Grid */}
        <section className="space-y-3 pt-3 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#E50914]" />
              <h2 className="text-xs sm:text-sm font-bold text-white">院线电影全收录</h2>
              <span className="text-[10px] text-[#A1A1AA]">({filteredMovies.length} 部影片)</span>
            </div>

            {/* Filter buttons with compact micro-typography */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {subGenres.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubGenre(sub)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition whitespace-nowrap cursor-pointer ${
                    selectedSubGenre === sub
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'bg-[#111318] text-[#A1A1AA] hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* 2:3 Movie Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
