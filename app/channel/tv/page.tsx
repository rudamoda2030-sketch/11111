'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import MovieCard from '@/components/MovieCard';
import MovieRow from '@/components/MovieRow';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';
import { Tv, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TvChannelPage() {
  const [series, setSeries] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('全部');

  useEffect(() => {
    let isCancelled = false;
    // Type 2 is TV Series in MacCMS
    fetch('/api/v1/movies?typeId=2&limit=40')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data?.list) {
          setSeries(data.data.list);
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

  const heroItem = series.length > 0 ? series[0] : null;

  const regions = ['全部', '国产剧', '欧美剧', '日韩剧', '港台剧'];

  const filteredSeries = useMemo(() => {
    if (selectedRegion === '全部') return series;
    return series.filter((m) => 
      m.typeName?.includes(selectedRegion.replace('剧', '')) ||
      m.area?.includes(selectedRegion.replace('剧', ''))
    );
  }, [series, selectedRegion]);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-24 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">连续剧频道</span>
        </div>

        {/* Hero */}
        {isLoading ? (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] min-h-[260px] max-h-[460px] rounded-xl bg-[#111318] animate-pulse border border-white/5" />
        ) : (
          heroItem && <HeroBanner movie={heroItem} />
        )}

        {/* Featured Series */}
        {series.length > 0 && (
          <MovieRow title="追剧热播榜" movies={series} badge="更新中" />
        )}

        {/* Region Filter & Grid */}
        <section className="space-y-3 pt-3 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#E50914]" />
              <h2 className="text-xs sm:text-sm font-bold text-white">热播连续剧</h2>
              <span className="text-[10px] text-[#A1A1AA]">({filteredSeries.length} 部剧集)</span>
            </div>

            {/* Filter buttons with compact micro-typography */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition whitespace-nowrap cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'bg-[#111318] text-[#A1A1AA] hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* 2:3 Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {filteredSeries.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
