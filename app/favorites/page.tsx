'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Film, Trash2, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<NormalizedMovieDetail[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('ruda_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const clearAllFavorites = () => {
    if (window.confirm('确认清空所有已收藏的影片吗？')) {
      localStorage.removeItem('ruda_favorites');
      setFavorites([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">我的收藏</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E50914]/20 text-[#E50914] flex items-center justify-center border border-[#E50914]/30">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white">我的专属片单</h1>
              <p className="text-xs text-[#A1A1AA]">已收藏 {favorites.length} 部影片</p>
            </div>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={clearAllFavorites}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#191B20] hover:bg-white/10 text-[#A1A1AA] hover:text-rose-400 text-xs border border-white/10 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空片单</span>
            </button>
          )}
        </div>

        {/* Content */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {favorites.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4 bg-[#111318] rounded-xl border border-white/5 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#191B20] flex items-center justify-center text-[#E50914]">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">片单空空如也</h3>
              <p className="text-xs text-[#A1A1AA] max-w-xs mx-auto">
                在任意影视详情页点击“加入片单”，即可随时继续重温。
              </p>
            </div>
            <Link
              href="/category"
              className="inline-block px-6 py-2.5 rounded-md bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold shadow-lg shadow-[#E50914]/30 transition"
            >
              前往影视片库挑选
            </Link>
          </div>
        )}

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
