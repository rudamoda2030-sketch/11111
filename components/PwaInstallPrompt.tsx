'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });

  useEffect(() => {
    if (typeof window === 'undefined' || isStandalone) return;

    // Check if dismissed recently (within 2 days)
    const lastDismissed = localStorage.getItem('ruda_pwa_dismissed');
    if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 172800000) {
      return;
    }

    // Capture Chrome/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show prompt after delay
    if (isIOS) {
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone, isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    try {
      localStorage.setItem('ruda_pwa_dismissed', String(Date.now()));
    } catch {}
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom App Install Bar (Mobile Native Look) */}
      <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slideUp">
        <div className="bg-[#111318]/95 border border-white/15 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center gap-3">
          {/* App Icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E50914] to-black p-0.5 shrink-0 shadow-md">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center font-black text-[#E50914] text-xs">
              R
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white truncate">RUDAFLIX 独立客户端</h4>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#E50914] text-white font-bold">App</span>
            </div>
            <p className="text-[10px] text-[#A1A1AA] truncate mt-0.5">
              像原生 App 一样全屏沉浸播放 · 无浏览器网址栏
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white text-[11px] font-bold shrink-0 transition active:scale-95 cursor-pointer shadow-md shadow-[#E50914]/30"
          >
            安装
          </button>

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="p-1 text-white/40 hover:text-white rounded-full transition shrink-0"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Native Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#E50914]" />
                <h3 className="text-sm font-bold text-white">添加到 iPhone 主屏幕</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#A1A1AA]">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span>1. 点击 Safari 底部工具栏的【分享】图标</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. 在弹出菜单中向下滑动，选择【添加到主屏幕】</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-[#E50914]/20 text-[#E50914] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>3. 点击右上角【添加】，桌面上即可直接启动独立 App</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold transition shadow-lg shadow-[#E50914]/30"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}
