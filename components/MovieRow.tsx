'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { NormalizedMovieDetail } from '@/types/maccms';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: NormalizedMovieDetail[];
  viewAllHref?: string;
  badge?: string;
  layout?: 'poster' | 'landscape';
}

export default function MovieRow({ 
  title, 
  movies, 
  viewAllHref, 
  badge,
  layout = 'poster'
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

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
      {/* Row Header with Red Accent Bar (Compact font) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-l-[3px] border-[#E50914] pl-2">
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
              {badge}
            </span>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[10px] text-[#A1A1AA] hover:text-white transition flex items-center gap-0.5"
          >
            <span>全部</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Row Container with Scroll Affordances */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-7 sm:w-8 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer rounded-r"
          aria-label="向左滚动"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Cards Track */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-1.5 px-0.5"
        >
          {movies.map((movie) => {
            if (layout === 'landscape') {
              return (
                <div key={movie.id} className="w-52 sm:w-60 md:w-64 shrink-0 group/card">
                  <Link
                    href={`/movie/${movie.id}`}
                    className="block rounded-lg overflow-hidden bg-[#141414] border border-white/[0.06] hover:border-white/20 transition shadow-lg relative"
                  >
                    <div className="relative aspect-video w-full bg-[#0a0a0a] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top opacity-75 group-hover/card:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/60 border border-white/60 text-white flex items-center justify-center group-hover/card:scale-110 group-hover/card:bg-[#E50914] group-hover/card:border-[#E50914] transition-all shadow-xl">
                          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white truncate group-hover/card:text-[#E50914] transition-colors">
                        {movie.title}
                      </span>
                      <span className="text-[#A1A1AA] text-[10px] shrink-0 ml-2">
                        {movie.year || '2026'}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            }

            return (
              <div key={movie.id} className="w-28 sm:w-36 md:w-40 lg:w-44 shrink-0">
                <MovieCard movie={movie} />
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
