'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Compass, 
  Flame, 
  Bookmark,
  User 
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: '首页',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: '片库目录',
      href: '/category',
      icon: Compass,
      isActive: pathname.startsWith('/category'),
    },
    {
      label: '热度榜',
      href: '/ranking',
      icon: Flame,
      isActive: pathname.startsWith('/ranking'),
    },
    {
      label: '我的片单',
      href: '/favorites',
      icon: Bookmark,
      isActive: pathname.startsWith('/favorites'),
    },
    {
      label: '个人中心',
      href: '/profile',
      icon: User,
      isActive: pathname.startsWith('/profile'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000]/92 backdrop-blur-2xl border-t border-white/[0.08] px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),8px)] transition-all">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-all duration-200 select-none active:scale-90 ${
                item.isActive
                  ? 'text-[#E50914] font-bold'
                  : 'text-[#A1A1AA]/80 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.4] filter drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]' : 'stroke-[1.8]'}`} />
                {item.isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
                )}
              </div>
              <span className={`text-[9.5px] mt-1 tracking-tight ${item.isActive ? 'text-white font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
