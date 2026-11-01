'use client';

import React from 'react';
import Link from 'next/link';
import { Film, Home, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 space-y-6">
        <div className="relative">
          <span className="font-black text-8xl sm:text-9xl tracking-tighter text-[#191B20] select-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914] shadow-lg">
              <Film className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-white">迷失在光影之间</h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            抱歉，您访问的影视内容似乎已被封存或不存在。不妨回到首页探索更多精彩影视。
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#E50914] hover:bg-[#B80710] text-xs font-bold text-white transition shadow-lg shadow-[#E50914]/30"
          >
            <Home className="w-4 h-4" />
            <span>返回影院首页</span>
          </Link>
          <Link
            href="/category"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#191B20] hover:bg-white/10 text-xs font-semibold text-white transition border border-white/10"
          >
            <Search className="w-4 h-4" />
            <span>浏览全部片库</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
