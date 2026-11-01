'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { NormalizedMovieDetail } from '@/types/maccms';

interface MovieCardProps {
  movie: NormalizedMovieDetail;
  rank?: number;
  compact?: boolean;
}

export default function MovieCard({ movie, compact = false }: MovieCardProps) {
  const hasRealScore = movie.score && movie.score !== '0' && movie.score !== '0.0' && movie.score !== '';

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative flex flex-col bg-[#141414] rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/80 hover:-translate-y-1 block border border-white/[0.05] hover:border-white/20"
    >
      {/* 2:3 Cinematic Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-[#0a0a0a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Subtle Dark Vignette on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity" />

        {/* Real Score Badge (Top Right) */}
        {hasRealScore && (
          <div className="absolute top-1.5 right-1.5 px-1 py-0.2 rounded bg-black/80 backdrop-blur-sm text-[9px] font-bold text-[#E50914] flex items-center gap-0.5 border border-white/10 shadow">
            <Star className="w-2.5 h-2.5 fill-current text-[#E50914]" />
            <span>{movie.score}</span>
          </div>
        )}

        {/* Real Remarks / Episode Status (Bottom Left) */}
        {movie.remarks && (
          <div className="absolute bottom-1.5 left-1.5 px-1 py-0.2 rounded bg-black/85 backdrop-blur-sm text-[9px] text-white/90 font-medium border border-white/10 max-w-[85%] truncate">
            {movie.remarks}
          </div>
        )}

        {/* Netflix Quick Play Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg shadow-[#E50914]/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Info Block (Micro-refined typography) */}
      <div className={`p-2 flex-1 flex flex-col justify-between ${compact ? 'p-1.5' : ''}`}>
        <h3 className="text-[11px] sm:text-xs font-semibold text-white group-hover:text-[#E50914] transition-colors truncate">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#A1A1AA] mt-0.5">
          {movie.year && <span>{movie.year}</span>}
          {movie.year && movie.typeName && <span>·</span>}
          {movie.typeName && <span>{movie.typeName}</span>}
          {movie.area && (
            <>
              <span>·</span>
              <span className="truncate max-w-[45px]">{movie.area.split('/')[0]}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
