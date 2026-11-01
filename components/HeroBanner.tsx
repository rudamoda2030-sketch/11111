'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { NormalizedMovieDetail } from '@/types/maccms';

interface HeroBannerProps {
  movie: NormalizedMovieDetail;
  movieList?: NormalizedMovieDetail[];
}

export default function HeroBanner({ movie, movieList = [] }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredList = movieList.length > 0 ? movieList.slice(0, 5) : [movie];
  const activeMovie = featuredList[currentIndex] || movie;

  if (!activeMovie) return null;

  const hasScore = activeMovie.score && activeMovie.score !== '0' && activeMovie.score !== '0.0';

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : featuredList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev < featuredList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[340px] max-h-[500px] rounded-xl overflow-hidden shadow-2xl bg-[#000000] border border-white/5 group/hero">
      {/* Background Cinematic Poster Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeMovie.id}
          src={activeMovie.poster}
          alt={activeMovie.title}
          className="w-full h-full object-cover object-top opacity-60 scale-100 transition-all duration-700 filter brightness-95"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';
          }}
        />
        {/* Multi-layer Vignette Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent w-full sm:w-2/3" />
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#000000]/80 to-transparent" />
      </div>

      {/* Left/Right Slider Navigation Arrows */}
      {featuredList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/hero:opacity-100 transition-opacity cursor-pointer border border-white/10"
            aria-label="上一张"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/hero:opacity-100 transition-opacity cursor-pointer border border-white/10"
            aria-label="下一张"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Hero Content Overlay (Refined compact typography) */}
      <div className="relative h-full flex flex-col justify-end p-5 sm:p-10 max-w-xl space-y-2 sm:space-y-3 z-10">
        
        {/* Red N MOVIE badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#E50914] font-black tracking-widest text-[10px] sm:text-[11px] flex items-center gap-1">
            <span className="text-xs sm:text-sm">N</span> MOVIE
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] text-[#A1A1AA]/60 font-mono">rudaflix.com</span>
        </div>

        {/* Title (Refined size) */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase drop-shadow-lg leading-tight line-clamp-2">
          {activeMovie.title}
        </h1>

        {/* Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-[#A1A1AA]">
          {hasScore && (
            <span className="text-white font-bold flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-current text-amber-400" />
              <span>{activeMovie.score}</span>
            </span>
          )}
          <span>{activeMovie.year || '2026'}</span>
          <span>·</span>
          <span>{activeMovie.typeName || '精选大片'}</span>
          <span>·</span>
          <span>{activeMovie.area ? activeMovie.area.split('/')[0] : '院线'}</span>
          <span className="px-1 py-0.2 rounded bg-white/15 text-white text-[9px] font-bold border border-white/20">
            HD
          </span>
          {activeMovie.remarks && (
            <span className="text-white/70">{activeMovie.remarks}</span>
          )}
        </div>

        {/* Synopsis */}
        {activeMovie.description && (
          <p className="text-[11px] sm:text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed max-w-lg">
            {activeMovie.description.replace(/<[^>]+>/g, '')}
          </p>
        )}

        {/* Buttons (Compact refined size) */}
        <div className="flex items-center gap-2.5 pt-1">
          <Link
            href={`/watch/${activeMovie.id}?source=0&ep=0`}
            className="flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold shadow-lg shadow-[#E50914]/40 transition active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>立即播放</span>
          </Link>

          <Link
            href={`/movie/${activeMovie.id}`}
            className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md text-xs font-semibold transition active:scale-95 border border-white/10"
          >
            <Info className="w-3.5 h-3.5" />
            <span>更多信息</span>
          </Link>
        </div>

      </div>

      {/* Slide Dot Indicators */}
      {featuredList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {featuredList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-5 bg-[#E50914]' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`跳转到第 ${idx + 1} 部影片`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
