'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import MovieCard from '@/components/MovieCard';
import MovieRow from '@/components/MovieRow';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';
import { Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AnimeChannelPage() {
  const [animes, setAnimes] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    // Type 4 is Anime in MacCMS, or fallback to keyword
    fetch('/api/v1/movies?typeId=4&limit=36')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data?.list) {
          // If typeId=4 has items, use it; otherwise fallback to anime-related
          if (data.data.list.length > 0) {
            setAnimes(data.data.list);
          } else {
            fetch('/api/v1/movies?keyword=兔&limit=36')
              .then((r) => r.json())
              .then((d2) => {
                if (!isCancelled && d2.success && d2.data?.list) {
                  setAnimes(d2.data.list);
                }
              });
          }
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

  const heroItem = animes.length > 0 ? animes[0] : null;

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-24 space-y-8">
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">动漫频道</span>
        </div>

        {isLoading ? (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] min-h-[280px] max-h-[480px] rounded-xl bg-[#111318] animate-pulse border border-white/5" />
        ) : (
          heroItem && <HeroBanner movie={heroItem} />
        )}

        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E50914]" />
              <h2 className="text-lg sm:text-xl font-bold text-white">精选动画与二次元剧场</h2>
              <span className="text-xs text-[#A1A1AA]">({animes.length} 部作品)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {animes.map((item) => (
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
