'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, 
  Film
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WatchPlayer from '@/components/WatchPlayer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const movieId = params.id as string;

  const sourceParam = searchParams.get('source');
  const epParam = searchParams.get('ep');

  const initialSourceIdx = sourceParam ? parseInt(sourceParam, 10) : 0;
  const initialEpIdx = epParam ? parseInt(epParam, 10) : 0;

  const [movie, setMovie] = useState<NormalizedMovieDetail | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;
    let isCancelled = false;

    fetch(`/api/v1/movies/${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          if (data.success && data.data) {
            setMovie(data.data);

            // Fetch related
            if (data.data.typeId) {
              fetch(`/api/v1/movies?typeId=${data.data.typeId}&limit=8`)
                .then((r) => r.json())
                .then((relData) => {
                  if (!isCancelled && relData.success && relData.data?.list) {
                    setRelatedMovies(
                      relData.data.list.filter((m: NormalizedMovieDetail) => String(m.id) !== String(movieId)).slice(0, 6)
                    );
                  }
                })
                .catch(() => {});
            }
          } else {
            setError(data.message || '影片不存在');
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || '加载播放信息失败');
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [movieId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 animate-pulse space-y-6">
          <div className="aspect-video w-full bg-[#111318] rounded-xl border border-white/5" />
          <div className="h-28 bg-[#111318] rounded-xl border border-white/5" />
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#181818] text-[#E50914] flex items-center justify-center border border-white/10">
            <Film className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">无法播放此影片</h2>
          <p className="text-xs text-[#A1A1AA]">{error || '播放源不存在或已被移除'}</p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-md bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-semibold transition"
          >
            返回首页
          </Link>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-4 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <Link href={`/movie/${movie.id}`} className="hover:text-white transition truncate">
            {movie.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[#E50914] font-medium">沉浸观影</span>
        </div>

        {/* The Complete WatchPlayer matching Reference Image 1 */}
        <WatchPlayer
          movie={movie}
          initialSourceIndex={initialSourceIdx}
          initialEpisodeIndex={initialEpIdx}
          relatedMovies={relatedMovies}
        />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
      <WatchContent />
    </Suspense>
  );
}
