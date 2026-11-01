'use client';

import React from 'react';
import Link from 'next/link';
import { Youtube, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#000000] py-10 text-[#A1A1AA] text-xs pb-24 md:pb-10 mt-14 relative overflow-hidden">
      {/* Subtle red wave glow along top */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#E50914]/40 to-transparent pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-6">
        
        {/* Brand & Tagline */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-[#E50914] font-mono">
                RUDAFLIX
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                rudaflix.com
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]/80">
              Watch More. Feel More. · 专为影迷打造的高清流媒体视听平台
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 text-white/60">
            <a href="#" className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition">
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition">
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition">
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Links Line */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] border-t border-white/5 pt-5">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <Link href="/channel/movie" className="hover:text-white transition">电影</Link>
          <Link href="/channel/tv" className="hover:text-white transition">连续剧</Link>
          <Link href="/channel/anime" className="hover:text-white transition">动漫专区</Link>
          <Link href="/channel/variety" className="hover:text-white transition">综艺娱乐</Link>
          <Link href="/ranking" className="hover:text-white transition">排行榜</Link>
          <Link href="/topic" className="hover:text-white transition">精选合集</Link>
          <Link href="/category" className="hover:text-white transition">片库全览</Link>
          <Link href="/favorites" className="hover:text-white transition">我的片单</Link>
          <Link href="/profile" className="hover:text-white transition">会员中心</Link>
        </div>

        {/* Legal Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[10px] text-[#A1A1AA]/50 pt-1">
          <p>
            © {new Date().getFullYear()} RUDAFLIX (rudaflix.com) · 原生对接 Apple CMS V10 影视流媒体解析与播放。
          </p>
          <div className="flex items-center gap-2.5">
            <span>4K HDR 杜比全景声</span>
            <span>·</span>
            <span>无广告流媒体直连</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
