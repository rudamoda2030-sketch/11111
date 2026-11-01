'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Sparkles, ChevronRight, Film, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieRow from '@/components/MovieRow';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';

export default function TopicPage() {
  const [movies, setMovies] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Curated collections
  const sciFiTopic = movies.filter((m) => 
    m.typeId === 8 || m.typeName?.includes('科幻') || m.description?.includes('未来') || m.title.includes('钢铁之泪') || m.title.includes('机械迷宫')
  );

  const topRatedTopic = [...movies]
    .filter((m) => parseFloat(m.score || '0') >= 8.5)
    .sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));

  const actionTopic = movies.filter((m) => 
    m.typeId === 6 || m.typeName?.includes('动作') || m.title.includes('大雄兔') || m.title.includes('霓虹暗影')
  );

  const animeTopic = movies.filter((m) => 
    m.typeId === 4 || m.typeName?.includes('动') || m.title.includes('辛特尔') || m.title.includes('大雄兔')
  );

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-10 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">专题策划</span>
        </div>

        {/* Page Header */}
        <div className="relative p-6 sm:p-10 rounded-xl bg-gradient-to-r from-[#191B20] via-[#111318] to-[#08090B] border border-white/5 overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="text-xs font-bold text-[#E50914] tracking-widest uppercase">
              TOPIC CURATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              独家专题 · 影迷深度策划
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              汇聚豆瓣殿堂高分、好莱坞工业美学、赛博朋克与科幻史诗，为您量身打造的主题片单。
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#E50914]/10 to-transparent pointer-events-none" />
        </div>

        {/* Topic 1: 豆瓣高分神作大赏 */}
        {topRatedTopic.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-l-2 border-[#E50914] pl-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">豆瓣 8.5+ 殿堂神作大赏</h2>
              <span className="text-xs text-[#A1A1AA]">影史传世口碑 · 必看经典</span>
            </div>
            <MovieRow title="" movies={topRatedTopic} />
          </div>
        )}

        {/* Topic 2: 硬核科幻 · 穿梭时空 */}
        {sciFiTopic.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-l-2 border-[#E50914] pl-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">硬核科幻 · 穿梭未知维度</h2>
              <span className="text-xs text-[#A1A1AA]">星际远航、赛博觉醒与意识重构</span>
            </div>
            <MovieRow title="" movies={sciFiTopic} />
          </div>
        )}

        {/* Topic 3: 动作狂澜 */}
        {actionTopic.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-l-2 border-[#E50914] pl-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">极速狂飙 · 肾上腺素动作大片</h2>
              <span className="text-xs text-[#A1A1AA]">绝境反击、拳拳到肉与视觉冲击</span>
            </div>
            <MovieRow title="" movies={actionTopic} />
          </div>
        )}

        {/* Topic 4: 治愈奇幻动画 */}
        {animeTopic.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-l-2 border-[#E50914] pl-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">奇幻与温情 · 视觉艺术精选</h2>
              <span className="text-xs text-[#A1A1AA]">天马行空的想象力世界</span>
            </div>
            <MovieRow title="" movies={animeTopic} />
          </div>
        )}

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
