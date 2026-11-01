'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Flame, Star, Clock, Trophy, Film, Tv, Play, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';

const RANK_TABS = [
  { id: 'all', name: '全网综合热榜', icon: Flame },
  { id: 'movie', name: '院线电影热榜', icon: Film },
  { id: 'tv', name: '连续剧热榜', icon: Tv },
  { id: 'score', name: '高分殿堂榜', icon: Star },
  { id: 'latest', name: '最新上映榜', icon: Clock },
];

function RankingContent() {
  const [movies, setMovies] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let isCancelled = false;
    fetch('/api/v1/movies?limit=60')
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

  const rankedList = useMemo(() => {
    let list = [...movies];

    if (activeTab === 'movie') {
      list = list.filter((m) => m.typeId === 1 || m.typeName?.includes('片'));
    } else if (activeTab === 'tv') {
      list = list.filter((m) => m.typeId === 2 || m.typeName?.includes('剧'));
    } else if (activeTab === 'score') {
      list.sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
      return list.slice(0, 20);
    } else if (activeTab === 'latest') {
      list.sort((a, b) => parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10));
      return list.slice(0, 20);
    }

    // Default hotness sorting
    list.sort((a, b) => {
      const scoreA = parseFloat(a.score || '0');
      const scoreB = parseFloat(b.score || '0');
      if (scoreB !== scoreA) return scoreB - scoreA;
      return parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10);
    });

    return list.slice(0, 20);
  }, [movies, activeTab]);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">排行榜</span>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>RUDAFLIX 官方全网热度风云榜</span>
              <span className="text-[9px] text-[#E50914] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10">rudaflix.com</span>
            </h1>
            <p className="text-[10px] text-[#A1A1AA] mt-0.5">每日基于播放热度、完播率与全网评分实时更新</p>
          </div>
        </div>

        {/* Rank Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {RANK_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E50914] text-white font-bold shadow-md shadow-[#E50914]/30'
                    : 'bg-[#111318] text-[#A1A1AA] hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Ranked Items List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-[#111318] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {rankedList.map((movie, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              return (
                <div
                  key={movie.id}
                  className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-2.5 rounded-lg bg-[#111318] hover:bg-[#181818] border border-white/[0.05] hover:border-white/15 transition group"
                >
                  {/* Rank Number Badge */}
                  <div
                    className={`w-7 sm:w-8 text-center font-black text-sm sm:text-lg select-none ${
                      rank === 1
                        ? 'text-[#E50914]'
                        : rank === 2
                        ? 'text-amber-400'
                        : rank === 3
                        ? 'text-orange-400'
                        : 'text-white/30'
                    }`}
                  >
                    {rank < 10 ? `0${rank}` : rank}
                  </div>

                  {/* Poster */}
                  <Link href={`/movie/${movie.id}`} className="w-10 sm:w-12 aspect-[2/3] rounded bg-[#191B20] overflow-hidden shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/movie/${movie.id}`}
                        className="text-xs font-bold text-white group-hover:text-[#E50914] transition truncate"
                      >
                        {movie.title}
                      </Link>
                      {movie.remarks && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-black/60 text-[#A1A1AA] border border-white/10 shrink-0">
                          {movie.remarks}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA] mt-0.5">
                      <span>{movie.year || '2026'}</span>
                      <span>·</span>
                      <span>{movie.typeName}</span>
                      {movie.area && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[70px]">{movie.area.split('/')[0]}</span>
                        </>
                      )}
                      {movie.score && movie.score !== '0' && (
                        <>
                          <span>·</span>
                          <span className="text-[#E50914] font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {movie.score}
                          </span>
                        </>
                      )}
                    </div>

                    {movie.description && (
                      <p className="text-[10px] text-[#A1A1AA]/70 line-clamp-1 mt-0.5 hidden sm:block">
                        {movie.description.replace(/<[^>]+>/g, '')}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    <Link
                      href={`/watch/${movie.id}?source=0&ep=0`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#E50914] hover:bg-[#B80710] text-white text-[10px] font-bold transition shadow"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">播放</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
      <RankingContent />
    </Suspense>
  );
}
