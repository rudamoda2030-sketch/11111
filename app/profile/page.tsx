'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Clock, 
  Bookmark, 
  Smartphone, 
  Sliders, 
  Play, 
  Trash2, 
  ChevronRight, 
  ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import AppleAppModal from '@/components/AppleAppModal';
import SettingsModal from '@/components/SettingsModal';

interface WatchHistoryItem {
  movieId: string | number;
  movieTitle: string;
  poster: string;
  sourceIndex: number;
  episodeIndex: number;
  episodeName: string;
  sourceName: string;
  timestamp: number;
}

export default function ProfilePage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const hStr = localStorage.getItem('ruda_watch_history');
      return hStr ? JSON.parse(hStr) : [];
    } catch {
      return [];
    }
  });

  const [favoritesCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const fStr = localStorage.getItem('ruda_favorites');
      return fStr ? JSON.parse(fStr).length : 0;
    } catch {
      return 0;
    }
  });

  const [showAppleModal, setShowAppleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const removeHistoryItem = (movieId: string | number) => {
    const updated = history.filter((item) => String(item.movieId) !== String(movieId));
    setHistory(updated);
    localStorage.setItem('ruda_watch_history', JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    if (window.confirm('确认清空所有播放历史吗？')) {
      setHistory([]);
      localStorage.removeItem('ruda_watch_history');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">会员中心</span>
        </div>

        {/* User Card */}
        <div className="p-6 bg-[#111318] rounded-xl border border-white/5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#E50914] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#E50914]/30">
            N
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">尊享流媒体会员</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#E50914] text-white text-[10px] font-bold">
                VIP PREMIUM
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">4K HDR 杜比全景声 · 极速无阻自适应播放</p>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0">
            <Link
              href="/favorites"
              className="flex flex-col items-center p-3 rounded-lg bg-[#191B20] border border-white/5 w-20 hover:border-[#E50914] transition"
            >
              <span className="text-base font-bold text-[#E50914] font-mono">{favoritesCount}</span>
              <span className="text-[10px] text-[#A1A1AA] mt-0.5">我的片单</span>
            </Link>
            <div className="flex flex-col items-center p-3 rounded-lg bg-[#191B20] border border-white/5 w-20">
              <span className="text-base font-bold text-white font-mono">{history.length}</span>
              <span className="text-[10px] text-[#A1A1AA] mt-0.5">观影历史</span>
            </div>
          </div>
        </div>

        {/* Quick Functional Menu: Apple CMS Config & Client Protocol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Apple App Import Guide */}
          <button
            onClick={() => setShowAppleModal(true)}
            className="flex items-center justify-between p-4 rounded-xl bg-[#111318] border border-white/5 hover:border-white/20 transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#191B20] text-white flex items-center justify-center border border-white/5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] transition">
                  Apple TV / 移动客户端源
                </h3>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                  获取苹果手机与电视影视专属协议配置
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition" />
          </button>

          {/* Admin Gateway */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-between p-4 rounded-xl bg-[#111318] border border-white/5 hover:border-white/20 transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#191B20] text-[#E50914] flex items-center justify-center border border-white/5">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] transition">
                  Apple CMS V10 解析控制台
                </h3>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                  后台连接状态、源线路探测与安全白名单
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition" />
          </button>

        </div>

        {/* Watch History Section */}
        <div className="p-4 sm:p-6 bg-[#111318] rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E50914]" />
              <h2 className="text-sm sm:text-base font-bold text-white">播放记录</h2>
              <span className="text-xs text-[#A1A1AA]">({history.length} 条记录)</span>
            </div>

            {history.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="text-xs text-[#A1A1AA] hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空历史</span>
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-2.5 max-h-96 overflow-y-auto no-scrollbar pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#191B20] border border-white/5 hover:border-white/20 transition group"
                >
                  <Link
                    href={`/watch/${item.movieId}?source=${item.sourceIndex}&ep=${item.episodeIndex}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-12 h-16 bg-[#111318] rounded overflow-hidden shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.poster} alt={item.movieTitle} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition">
                        {item.movieTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] mt-1">
                        <span className="text-[#E50914] font-medium">{item.episodeName}</span>
                        <span>·</span>
                        <span>{item.sourceName}</span>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => removeHistoryItem(item.movieId)}
                    className="p-2 text-white/30 hover:text-rose-400 transition cursor-pointer"
                    title="移除单条"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2 text-[#A1A1AA]">
              <Clock className="w-8 h-8 mx-auto text-white/20" />
              <p className="text-xs">暂无播放历史，去片库开启精彩观影之旅吧</p>
            </div>
          )}
        </div>

      </main>

      <Footer />
      <MobileBottomNav />

      {/* Kept Modals for technical compliance & MacCMS setup */}
      {showAppleModal && <AppleAppModal onClose={() => setShowAppleModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </div>
  );
}
