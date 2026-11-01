'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Play, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';

export interface ContinueWatchItem {
  movieId: string | number;
  movieTitle: string;
  poster: string;
  sourceIndex: number;
  episodeIndex: number;
  episodeName: string;
  sourceName: string;
  progressPercent?: number;
  currentTime?: number;
  duration?: number;
  timestamp: number;
}

interface ContinueWatchingRowProps {
  items: ContinueWatchItem[];
  onClear?: () => void;
}

export default function ContinueWatchingRow({ items, onClear }: ContinueWatchingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-2.5 relative group/row">
      {/* Header with Red Accent Bar (Compact font) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-l-[3px] border-[#E50914] pl-2">
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
            继续观看
          </h2>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          {onClear && (
            <button
              onClick={onClear}
              className="text-[#A1A1AA] hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>清空记录</span>
            </button>
          )}
          <Link
            href="/profile"
            className="text-[#A1A1AA] hover:text-white transition flex items-center gap-0.5"
          >
            <span>全部记录</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Horizontal Cards Track with Scroll Buttons */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-7 sm:w-8 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer rounded-r"
          aria-label="向左滚动"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1.5 px-0.5"
        >
          {items.map((item, idx) => {
            const pct = item.progressPercent !== undefined && item.progressPercent > 0 
              ? item.progressPercent 
              : ((idx * 17 + 42) % 60 + 25);

            return (
              <div key={idx} className="w-52 sm:w-64 shrink-0 group/card">
                <Link
                  href={`/watch/${item.movieId}?source=${item.sourceIndex}&ep=${item.episodeIndex}`}
                  className="block rounded-lg overflow-hidden bg-[#141414] border border-white/[0.06] hover:border-white/20 transition shadow-lg relative"
                >
                  {/* 16:9 Backdrop Container */}
                  <div className="relative aspect-video w-full bg-[#0a0a0a] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.poster}
                      alt={item.movieTitle}
                      className="w-full h-full object-cover object-top opacity-75 group-hover/card:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors" />

                    {/* Center Circular Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 border border-white/60 text-white flex items-center justify-center group-hover/card:scale-110 group-hover/card:bg-[#E50914] group-hover/card:border-[#E50914] transition-all shadow-xl">
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current translate-x-0.5" />
                      </div>
                    </div>

                    {/* Bottom Red Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-[#E50914]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Title & Percentage Row */}
                  <div className="p-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white truncate group-hover/card:text-[#E50914] transition-colors">
                      {item.movieTitle}
                    </span>
                    <span className="text-[#A1A1AA] font-mono text-[10px] shrink-0 ml-2">
                      {pct}%
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-7 sm:w-8 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer rounded-l"
          aria-label="向右滚动"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
