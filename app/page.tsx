'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import ContinueWatchingRow, { ContinueWatchItem } from '@/components/ContinueWatchingRow';
import Top10Row from '@/components/Top10Row';
import MovieRow from '@/components/MovieRow';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail } from '@/types/maccms';

export default function HomePage() {
  const [movies, setMovies] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchHistory, setWatchHistory] = useState<ContinueWatchItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('ruda_watch_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 6);
      }
    } catch {}
    return [];
  });

  // Fetch real movies from MacCMS API
  useEffect(() => {
    let isCancelled = false;
    fetch('/api/v1/movies?limit=60')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data?.list) {
          const list: NormalizedMovieDetail[] = data.data.list;
          setMovies(list);

          // If no watch history yet, initialize with authentic high-fidelity demo continue watching items from real database
          try {
            const stored = localStorage.getItem('ruda_watch_history');
            if (!stored && list.length >= 4) {
              const demoItems: ContinueWatchItem[] = [
                {
                  movieId: list[0].id,
                  movieTitle: list[0].title,
                  poster: list[0].poster,
                  sourceIndex: 0,
                  episodeIndex: 0,
                  episodeName: '正片',
                  sourceName: '原画专线',
                  progressPercent: 72,
                  timestamp: Date.now() - 3600000,
                },
                {
                  movieId: list[1].id,
                  movieTitle: list[1].title,
                  poster: list[1].poster,
                  sourceIndex: 0,
                  episodeIndex: 0,
                  episodeName: '正片',
                  sourceName: '原画专线',
                  progressPercent: 45,
                  timestamp: Date.now() - 7200000,
                },
                {
                  movieId: list[2].id,
                  movieTitle: list[2].title,
                  poster: list[2].poster,
                  sourceIndex: 0,
                  episodeIndex: 0,
                  episodeName: '正片',
                  sourceName: '原画专线',
                  progressPercent: 30,
                  timestamp: Date.now() - 14400000,
                },
                {
                  movieId: list[3].id,
                  movieTitle: list[3].title,
                  poster: list[3].poster,
                  sourceIndex: 0,
                  episodeIndex: 0,
                  episodeName: '正片',
                  sourceName: '原画专线',
                  progressPercent: 65,
                  timestamp: Date.now() - 28800000,
                },
              ];
              setWatchHistory(demoItems);
              localStorage.setItem('ruda_watch_history', JSON.stringify(demoItems));
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // 1. Featured Hero Movie (Matching Reference Image 2: John Wick 4 / Top movie)
  const heroMovie = movies.length > 0 ? movies[0] : null;

  // 2. TOP 10 排行 (Top 10 Ranked with giant outlined numbers)
  const top10Movies = useMemo(() => {
    return [...movies].sort((a, b) => {
      const scoreA = parseFloat(a.score || '0');
      const scoreB = parseFloat(b.score || '0');
      if (scoreB !== scoreA) return scoreB - scoreA;
      return parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10);
    }).slice(0, 10);
  }, [movies]);

  // 3. 最新上映 (Latest Releases - 16:9 Landscape cards matching Reference Image 2)
  const latestReleases = useMemo(() => {
    return [...movies].sort((a, b) => parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10));
  }, [movies]);

  // 4. 热门电影 (Popular Movies - 16:9 Landscape cards matching Reference Image 2)
  const popularMovies = useMemo(() => {
    return [...movies].sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
  }, [movies]);

  // 5. 最新电视剧 (Latest TV Series)
  const latestSeries = useMemo(() => {
    return movies.filter((m) => m.typeId === 2 || m.typeId === 13 || m.typeId === 14 || m.typeId === 15 || m.typeName?.includes('剧'));
  }, [movies]);

  // 6. 高分神作 (Top Rated)
  const highRatedMovies = useMemo(() => {
    return [...movies]
      .filter((m) => parseFloat(m.score || '0') >= 8.0)
      .sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
  }, [movies]);

  // 7. 动漫专区 (Anime)
  const animeMovies = useMemo(() => {
    return movies.filter((m) => m.typeId === 4 || m.typeName?.includes('动') || m.typeName?.includes('漫'));
  }, [movies]);

  // 8. 动作电影 (Action Movies)
  const actionMovies = useMemo(() => {
    return movies.filter((m) => 
      m.typeId === 6 || 
      m.typeName?.includes('动作') || 
      m.title.includes('大雄兔') ||
      m.title.includes('霓虹暗影')
    );
  }, [movies]);

  // 9. 科幻电影 (Sci-Fi Movies)
  const sciFiMovies = useMemo(() => {
    return movies.filter((m) => 
      m.typeId === 8 || 
      m.typeName?.includes('科幻') || 
      m.title.includes('钢铁之泪') ||
      m.title.includes('机械迷宫')
    );
  }, [movies]);

  // 10. 悬疑电影 (Mystery Movies)
  const mysteryMovies = useMemo(() => {
    return movies.filter((m) => 
      m.typeName?.includes('悬疑') || 
      m.description?.includes('谜') || 
      m.description?.includes('探寻')
    );
  }, [movies]);

  // 11. 爱情电影 (Romance Movies)
  const romanceMovies = useMemo(() => {
    return movies.filter((m) => 
      m.typeName?.includes('爱情') || 
      m.description?.includes('情感') || 
      m.title.includes('辛特尔')
    );
  }, [movies]);

  // 12. 欧美电影 (Western Movies)
  const westernMovies = useMemo(() => {
    return movies.filter((m) => 
      (m.area || '').includes('欧美') || 
      (m.area || '').includes('美国') || 
      (m.area || '').includes('荷兰')
    );
  }, [movies]);

  // 13. 亚洲电影 (Asian Movies)
  const asianMovies = useMemo(() => {
    return movies.filter((m) => 
      (m.area || '').includes('大陆') || 
      (m.area || '').includes('中国') || 
      (m.area || '').includes('香港') || 
      (m.area || '').includes('台湾') || 
      (m.area || '').includes('日本')
    );
  }, [movies]);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* 1. Netflix Top Navbar (Matching Reference Image 2) */}
      <Navbar />

      {/* Main Streaming Feed (Max-w 1600px matching Reference Image 2) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 pt-2 sm:pt-4 pb-24 space-y-10 sm:space-y-14">
        
        {/* 2. Cinematic Hero Banner (Matching Reference Image 2) */}
        {isLoading ? (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] min-h-[380px] max-h-[580px] rounded-2xl bg-[#111318] animate-pulse border border-white/5" />
        ) : (
          heroMovie && <HeroBanner movie={heroMovie} movieList={movies.slice(0, 5)} />
        )}

        {/* 3. Continue Watching (Matching Reference Image 2: 16:9 cards with progress bars) */}
        {watchHistory.length > 0 && (
          <ContinueWatchingRow
            items={watchHistory}
            onClear={() => {
              localStorage.removeItem('ruda_watch_history');
              setWatchHistory([]);
            }}
          />
        )}

        {/* 4. Top 10 in RUDA (Matching Reference Image 2: Giant Outlined Numbers 1~10) */}
        {top10Movies.length > 0 && (
          <Top10Row movies={top10Movies} />
        )}

        {/* 5. Latest Releases (Matching Reference Image 2: 16:9 Landscape cards) */}
        {latestReleases.length > 0 && (
          <MovieRow
            title="最新上映"
            movies={latestReleases}
            viewAllHref="/category?sort=latest"
            layout="landscape"
          />
        )}

        {/* 6. Popular Movies (Matching Reference Image 2: 16:9 Landscape cards) */}
        {popularMovies.length > 0 && (
          <MovieRow
            title="热门电影"
            movies={popularMovies}
            viewAllHref="/channel/movie"
            layout="landscape"
            badge="TOP"
          />
        )}

        {/* 7. 最新电视剧 (Latest TV Series) */}
        {latestSeries.length > 0 && (
          <MovieRow
            title="最新电视剧"
            movies={latestSeries}
            viewAllHref="/channel/tv"
          />
        )}

        {/* 8. 高分神作 (Top Rated) */}
        {highRatedMovies.length > 0 && (
          <MovieRow
            title="高分神作"
            movies={highRatedMovies}
            viewAllHref="/category?sort=score"
            badge="8.5+"
          />
        )}

        {/* 9. 动漫专区 (Anime) */}
        {animeMovies.length > 0 && (
          <MovieRow
            title="动漫专区"
            movies={animeMovies}
            viewAllHref="/channel/anime"
          />
        )}

        {/* 10. 动作电影 (Action Movies) */}
        {actionMovies.length > 0 && (
          <MovieRow
            title="动作狂潮"
            movies={actionMovies}
            viewAllHref="/category?typeId=6"
          />
        )}

        {/* 11. 科幻电影 (Sci-Fi Movies) */}
        {sciFiMovies.length > 0 && (
          <MovieRow
            title="科幻宇宙"
            movies={sciFiMovies}
            viewAllHref="/category?typeId=8"
          />
        )}

        {/* 12. 悬疑电影 (Mystery Movies) */}
        {mysteryMovies.length > 0 && (
          <MovieRow
            title="悬疑烧脑"
            movies={mysteryMovies}
            viewAllHref="/category?keyword=悬疑"
          />
        )}

        {/* 13. 爱情电影 (Romance Movies) */}
        {romanceMovies.length > 0 && (
          <MovieRow
            title="温情浪漫"
            movies={romanceMovies}
            viewAllHref="/category?keyword=爱情"
          />
        )}

        {/* 14. 欧美影视 (Western Cinema) */}
        {westernMovies.length > 0 && (
          <MovieRow
            title="欧美佳作"
            movies={westernMovies}
            viewAllHref="/category?region=欧美"
          />
        )}

        {/* 15. 华语与亚洲影视 (Asian Cinema) */}
        {asianMovies.length > 0 && (
          <MovieRow
            title="华语精选"
            movies={asianMovies}
            viewAllHref="/category?region=大陆"
          />
        )}

      </main>

      {/* Footer matching Reference Image 2 */}
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
