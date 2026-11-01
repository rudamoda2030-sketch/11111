'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import MovieCard from '@/components/MovieCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';
import { Mic2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function VarietyChannelPage() {
  const [variety, setVariety] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    // Type 3 is Variety in MacCMS
    fetch('/api/v1/movies?typeId=3&limit=36')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data?.list) {
          if (data.data.list.length > 0) {
            setVariety(data.data.list);
          } else {
            // Fallback to general entertainment
            fetch('/api/v1/movies?limit=24')
              .then((r) => r.json())
              .then((d2) => {
                if (!isCancelled && d2.success && d2.data?.list) {
                  setVariety(d2.data.list.slice(0, 18));
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

  const heroItem = variety.length > 0 ? variety[0] : null;

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-24 space-y-8">
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">综艺娱乐</span>
        </div>

        {isLoading ? (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] min-h-[280px] max-h-[480px] rounded-xl bg-[#111318] animate-pulse border border-white/5" />
        ) : (
          heroItem && <HeroBanner movie={heroItem} />
        )}

        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic2 className="w-5 h-5 text-[#E50914]" />
              <h2 className="text-lg sm:text-xl font-bold text-white">热播综艺娱乐</h2>
              <span className="text-xs text-[#A1A1AA]">({variety.length} 部节目)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {variety.map((item) => (
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
