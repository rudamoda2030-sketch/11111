'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  RotateCcw, 
  ChevronRight,
  Clock,
  Star,
  Flame
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import { NormalizedMovieDetail, MacCmsCategory } from '@/types/maccms';

const YEARS = ['全部', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2010年代'];
const REGIONS = ['全部', '大陆', '欧美', '日本', '韩国', '中国香港', '中国台湾'];
const SORTS = [
  { id: 'latest', name: '最新上映', icon: Clock },
  { id: 'score', name: '最高评分', icon: Star },
  { id: 'hot', name: '全网热播', icon: Flame }
];

function CategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTypeId = searchParams.get('typeId') ? Number(searchParams.get('typeId')) : undefined;
  const initialKeyword = searchParams.get('keyword') || searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'latest';
  const initialRegion = searchParams.get('region') || '全部';

  const [categories, setCategories] = useState<MacCmsCategory[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(initialTypeId);
  const [selectedYear, setSelectedYear] = useState<string>('全部');
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [keyword, setKeyword] = useState<string>(initialKeyword);

  const [movies, setMovies] = useState<NormalizedMovieDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch categories
  useEffect(() => {
    fetch('/api/v1/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch movies
  useEffect(() => {
    let isCancelled = false;

    const query = new URLSearchParams();
    if (selectedTypeId) query.set('typeId', String(selectedTypeId));
    if (keyword.trim()) query.set('keyword', keyword.trim());
    query.set('limit', '50');

    fetch(`/api/v1/movies?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data) {
          setMovies(data.data.list || []);
          setTotalCount(data.data.total || (data.data.list || []).length);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setMovies([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedTypeId, keyword]);

  // Client-side filtering by region, year, sort
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (selectedYear !== '全部') {
      if (selectedYear === '2010年代') {
        result = result.filter((m) => {
          const y = parseInt(m.year || '0', 10);
          return y >= 2010 && y <= 2019;
        });
      } else {
        result = result.filter((m) => (m.year || '').includes(selectedYear));
      }
    }

    if (selectedRegion !== '全部') {
      result = result.filter((m) => (m.area || '').includes(selectedRegion));
    }

    if (selectedSort === 'score') {
      result.sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
    } else if (selectedSort === 'latest') {
      result.sort((a, b) => parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10));
    } else if (selectedSort === 'hot') {
      result.sort((a, b) => {
        const scoreA = parseFloat(a.score || '0');
        const scoreB = parseFloat(b.score || '0');
        return scoreB - scoreA;
      });
    }

    return result;
  }, [movies, selectedYear, selectedRegion, selectedSort]);

  const handleResetFilters = () => {
    setSelectedTypeId(undefined);
    setSelectedYear('全部');
    setSelectedRegion('全部');
    setSelectedSort('latest');
    setKeyword('');
    router.push('/category');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-4 space-y-4 pb-24">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA] mb-0.5">
              <span onClick={() => router.push('/')} className="cursor-pointer hover:text-white">首页</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">片库全览</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>全网电影与剧集分类</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#181818] text-[#E50914] border border-[#E50914]/20 font-mono">
                {filteredMovies.length} 部
              </span>
            </h1>
          </div>

          {/* Search bar inside category */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="在片库中检索..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-[#111318] border border-white/10 rounded-md px-3 py-1.5 pl-8 text-[11px] text-white placeholder-white/35 focus:outline-none focus:border-[#E50914]"
              />
              <Search className="w-3 h-3 text-white/40 absolute left-2.5 top-2.5" />
            </div>

            {(selectedTypeId || selectedYear !== '全部' || selectedRegion !== '全部' || keyword) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#181818] hover:bg-white/10 text-[#A1A1AA] hover:text-white border border-white/10 text-[10px] transition cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">重置</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Box (Micro-refined typography for 目录字体) */}
        <div className="p-3.5 sm:p-4 bg-[#111318] rounded-xl border border-white/[0.06] space-y-2.5 shadow-lg">
          
          {/* Category Types (目录分类) */}
          <div className="flex items-start gap-2.5 text-[11px]">
            <span className="text-[#A1A1AA]/80 font-bold shrink-0 pt-0.5 w-9 text-[10px]">类型:</span>
            <div className="flex flex-wrap items-center gap-1 flex-1">
              <button
                onClick={() => setSelectedTypeId(undefined)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                  selectedTypeId === undefined
                    ? 'bg-[#E50914] text-white font-bold'
                    : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] border border-white/[0.05]'
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.type_id}
                  onClick={() => setSelectedTypeId(cat.type_id)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    selectedTypeId === cat.type_id
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] border border-white/[0.05]'
                  }`}
                >
                  {cat.type_name}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="flex items-start gap-2.5 text-[11px]">
            <span className="text-[#A1A1AA]/80 font-bold shrink-0 pt-0.5 w-9 text-[10px]">地区:</span>
            <div className="flex flex-wrap items-center gap-1 flex-1">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    selectedRegion === region
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] border border-white/[0.05]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div className="flex items-start gap-2.5 text-[11px]">
            <span className="text-[#A1A1AA]/80 font-bold shrink-0 pt-0.5 w-9 text-[10px]">年代:</span>
            <div className="flex flex-wrap items-center gap-1 flex-1">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    selectedYear === year
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] border border-white/[0.05]'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-start gap-2.5 text-[11px] pt-1.5 border-t border-white/[0.06]">
            <span className="text-[#A1A1AA]/80 font-bold shrink-0 pt-0.5 w-9 text-[10px]">排序:</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {SORTS.map((sort) => {
                const Icon = sort.icon;
                return (
                  <button
                    key={sort.id}
                    onClick={() => setSelectedSort(sort.id)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      selectedSort === sort.id
                        ? 'bg-white text-[#000000] font-bold'
                        : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] border border-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{sort.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Movie Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-md bg-[#111318] animate-pulse" />
            ))}
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2 bg-[#111318] rounded-xl border border-white/[0.06] max-w-sm mx-auto">
            <p className="text-xs font-semibold text-white">暂未找到符合条件的影片</p>
            <p className="text-[10px] text-[#A1A1AA]">可尝试缩减筛选条件或更换搜索关键词</p>
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 rounded bg-[#E50914] hover:bg-[#B80710] text-[10px] font-bold text-white transition"
            >
              清空筛选条件
            </button>
          </div>
        )}

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
      <CategoryContent />
    </Suspense>
  );
}
