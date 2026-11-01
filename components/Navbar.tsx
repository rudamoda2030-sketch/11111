'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  Bookmark, 
  Star, 
  Bell
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/movies?keyword=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      if (data.success && data.data?.list) {
        setSearchResults(data.data.list.slice(0, 6));
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowSearch(false);
      router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const navLinks = [
    { label: '首页', href: '/' },
    { label: '电影', href: '/channel/movie' },
    { label: '电视剧', href: '/channel/tv' },
    { label: '动漫', href: '/channel/anime' },
    { label: '排行榜', href: '/ranking' },
    { label: '专题', href: '/topic' },
    { label: '片库全览', href: '/category' },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 pt-safe ${
          isScrolled 
            ? 'bg-[#000000]/95 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/80' 
            : 'bg-gradient-to-b from-[#000000]/95 via-[#000000]/70 to-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-3.5 sm:px-8 h-12 sm:h-14 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: RUDAFLIX Brand Logo & rudaflix.com subtitle + Nav */}
          <div className="flex items-center gap-5 lg:gap-8">
            <Link href="/" className="flex items-baseline gap-1.5 shrink-0 group select-none">
              <span className="text-lg sm:text-xl font-black tracking-wider text-[#E50914] font-mono group-hover:scale-105 transition-transform">
                RUDAFLIX
              </span>
              <span className="text-[9px] text-[#A1A1AA]/50 font-mono tracking-wider hidden sm:inline-block">
                rudaflix.com
              </span>
            </Link>

            {/* Desktop Navigation Links (Micro-refined typography) */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-[11px] font-medium text-[#A1A1AA]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors whitespace-nowrap relative py-1 tracking-wide ${
                      isActive 
                        ? 'text-white font-bold' 
                        : 'hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#E50914] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Input + Bell + Favorites + User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop Header Search (Ultra-sleek) */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <input
                type="text"
                placeholder="搜索片名、演职员..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="w-40 lg:w-48 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-full py-1 pl-3 pr-7 text-[10px] text-white placeholder-white/35 focus:outline-none focus:border-[#E50914] focus:w-56 transition-all"
              />
              <button type="submit" className="absolute right-2 p-0.5 text-white/50 hover:text-white cursor-pointer">
                <Search className="w-2.5 h-2.5" />
              </button>
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="sm:hidden p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition active:scale-90"
              aria-label="搜索"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => router.push('/category?sort=hot')}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-white transition relative active:scale-90"
              title="新片上线通知"
            >
              <Bell className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#E50914]" />
            </button>

            {/* Favorites Icon */}
            <Link
              href="/favorites"
              className="p-1.5 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-white transition hidden sm:inline-block"
              title="我的片单"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </Link>

            {/* User Profile Avatar */}
            <Link
              href="/profile"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#181818] border border-white/20 hover:border-[#E50914] overflow-hidden flex items-center justify-center transition shadow-md active:scale-90"
              title="会员中心"
            >
              <div className="w-full h-full bg-[#E50914] flex items-center justify-center text-white text-[10px] font-black">
                R
              </div>
            </Link>
          </div>

        </div>

        {/* Mobile Native App Quick Category Chip Bar (Matches Netflix App Header) */}
        <div className="md:hidden px-3.5 pb-2 pt-0.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-all select-none active:scale-95 ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/[0.08] text-[#A1A1AA] hover:text-white border border-white/[0.06]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Global Quick Search Overlay Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#111318] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-3.5 space-y-3">
            
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Search className="w-3.5 h-3.5 text-white/50 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜索片名、演员或导演..."
                value={keyword}
                onChange={handleSearchChange}
                className="w-full bg-transparent text-[11px] text-white placeholder-white/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setKeyword('');
                  setSearchResults([]);
                }}
                className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Live Search Quick Results */}
            <div className="space-y-1 max-h-72 overflow-y-auto no-scrollbar">
              {isSearching ? (
                <div className="p-3 text-center text-[10px] text-[#A1A1AA]">正在检索 rudaflix.com 影视库...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((m) => (
                  <Link
                    key={m.id}
                    href={`/movie/${m.id}`}
                    onClick={() => setShowSearch(false)}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-11 bg-[#181818] rounded overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-semibold text-white group-hover:text-[#E50914] transition">
                          {m.title}
                        </h4>
                        <p className="text-[9px] text-[#A1A1AA] mt-0.5">
                          {m.year} · {m.typeName} {m.area ? `· ${m.area.split('/')[0]}` : ''}
                        </p>
                      </div>
                    </div>
                    {m.score && m.score !== '0' && (
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-[#E50914]">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>{m.score}</span>
                      </div>
                    )}
                  </Link>
                ))
              ) : keyword.trim() ? (
                <div className="p-3 text-center text-[10px] text-[#A1A1AA]">未找到相关影片</div>
              ) : (
                <div className="p-3 space-y-2">
                  <p className="text-[10px] text-[#A1A1AA]">热门搜索推荐：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['大雄兔', '钢铁之泪', '星际征途', '科幻', '动作', '动画'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setKeyword(tag);
                          setShowSearch(false);
                          router.push(`/search?q=${encodeURIComponent(tag)}`);
                        }}
                        className="px-2 py-0.5 rounded bg-[#181818] hover:bg-white/10 text-[10px] text-white/80 transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
