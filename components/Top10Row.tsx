'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { NormalizedMovieDetail } from '@/types/maccms';

interface Top10RowProps {
  movies: NormalizedMovieDetail[];
}

export default function Top10Row({ movies }: Top10RowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const top10 = movies.slice(0, 10);

  if (top10.length === 0) return null;

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
            TOP 10 热门精选
          </h2>
        </div>
        <Link href="/ranking" className="text-[10px] text-[#A1A1AA] hover:text-white transition flex items-center gap-0.5">
          <span>完整榜单</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Relative container with scroll buttons */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-8 sm:w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer rounded-r"
          aria-label="向左滚动"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar py-2 px-1"
        >
          {top10.map((movie, index) => {
            const rank = index + 1;
            return (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="relative flex-none flex items-end group/item cursor-pointer"
              >
                {/* Giant Outlined Rank Number */}
                <span
                  className="font-black text-6xl sm:text-8xl lg:text-[110px] tracking-tighter leading-none select-none stroke-number -mr-4 sm:-mr-6 z-0"
                  style={{
                    fontFamily: 'Impact, -apple-system, sans-serif',
                  }}
                >
                  {rank}
                </span>

                {/* Movie Poster Card */}
                <div className="relative w-28 sm:w-36 lg:w-40 aspect-[2/3] rounded-md overflow-hidden bg-[#141414] z-10 shadow-2xl transition-all duration-300 group-hover/item:scale-105 border border-white/10 group-hover/item:border-white/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover/item:opacity-40 transition-opacity" />

                  {/* Play hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover/item:scale-100 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom Movie Title overlay */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                    <p className="text-[10px] font-bold text-white truncate drop-shadow-md">
                      {movie.title}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-8 sm:w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer rounded-l"
          aria-label="向右滚动"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
