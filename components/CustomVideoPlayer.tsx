'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw,
  AlertCircle, 
  Tv,
  Subtitles,
  Settings,
  ChevronLeft,
  X,
  Gauge,
  FastForward,
  PictureInPicture2,
  Tv2,
  Keyboard,
  Sun,
  Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomVideoPlayerProps {
  url: string;
  type: 'hls' | 'mp4' | 'custom' | 'unknown' | string;
  movieId?: string | number;
  movieTitle?: string;
  episodeName?: string;
  sourceName?: string;
  totalEpisodes?: number;
  currentEpisodeIndex?: number;
  fallbackAvailable?: boolean;
  onSwitchFallback?: () => void;
  onRetry?: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  onOpenEpisodesDrawer?: () => void;
}

export default function CustomVideoPlayer({
  url,
  type,
  movieId,
  movieTitle = '在线播放',
  episodeName = '正片',
  sourceName = '官方专线',
  totalEpisodes = 1,
  currentEpisodeIndex = 0,
  fallbackAvailable,
  onSwitchFallback,
  onRetry,
  onNextEpisode,
  onPrevEpisode,
  onOpenEpisodesDrawer,
}: CustomVideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState('1080P');
  const [selectedSubtitle, setSelectedSubtitle] = useState('中文');
  const [selectedAudioTrack, setSelectedAudioTrack] = useState('国语');
  const [subtitleSize, setSubtitleSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [subtitleColor, setSubtitleColor] = useState<'white' | 'yellow' | 'cyan'>('white');
  const [brightness, setBrightness] = useState(100);
  const [colorPreset, setColorPreset] = useState<'hdr' | 'standard' | 'cinema' | 'night'>('hdr');
  const [isAmbilightOn, setIsAmbilightOn] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const nextTriggeredRef = useRef<boolean>(false);

  const storageKey = `ruda_progress_${movieId || movieTitle}_ep_${currentEpisodeIndex}`;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // 1. Initialize playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentTime(0);
    setNextCountdown(null);
    nextTriggeredRef.current = false;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = type === 'hls' || url.includes('.m3u8');

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      try {
        const savedTimeStr = localStorage.getItem(storageKey);
        if (savedTimeStr) {
          const savedTime = parseFloat(savedTimeStr);
          if (savedTime > 5 && savedTime < (video.duration - 15)) {
            video.currentTime = savedTime;
            const mins = Math.floor(savedTime / 60);
            const secs = Math.floor(savedTime % 60);
            showToast(`已为您恢复播放进度至 ${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`);
          }
        }
      } catch {}

      video.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
      });
    };

    if (isHlsStream) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, handleLoadedMetadata);

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setErrorMsg('网络流媒体加载失败，请检查网络或切换备用线路');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setErrorMsg('视频解码失败，正在尝试恢复');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setErrorMsg('流媒体播放错误，请更换播放线路');
                break;
            }
            setIsLoading(false);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', () => {
          setErrorMsg('Safari 原生流媒体加载失败，请重试');
          setIsLoading(false);
        });
      } else {
        setErrorMsg('当前浏览器不支持 HLS / M3U8 流媒体播放');
        setIsLoading(false);
      }
    } else {
      video.src = url;
      video.load();
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', () => {
        setErrorMsg('视频直链加载失败或文件不可访问');
        setIsLoading(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, type, storageKey, showToast]);

  // 2. Time update & save progress
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);

    const now = Date.now();
    if (now - lastSaveTimeRef.current > 2000 && cur > 0) {
      lastSaveTimeRef.current = now;
      try {
        localStorage.setItem(storageKey, String(cur));
        const rawHistory = localStorage.getItem('ruda_watch_history');
        if (rawHistory) {
          const list = JSON.parse(rawHistory);
          const percent = dur > 0 ? Math.min(100, Math.round((cur / dur) * 100)) : 0;
          const updated = list.map((item: any) => {
            if (String(item.movieId) === String(movieId)) {
              return { ...item, progressPercent: percent, currentTime: cur, duration: dur };
            }
            return item;
          });
          localStorage.setItem('ruda_watch_history', JSON.stringify(updated));
        }
      } catch {}
    }

    // Auto next countdown in last 10 seconds
    if (dur > 30 && onNextEpisode && currentEpisodeIndex < totalEpisodes - 1) {
      const remaining = dur - cur;
      if (remaining <= 10 && remaining > 0) {
        setNextCountdown(Math.ceil(remaining));
      } else if (remaining <= 0.5 && !nextTriggeredRef.current) {
        nextTriggeredRef.current = true;
        setNextCountdown(null);
        onNextEpisode();
      } else if (remaining > 10) {
        setNextCountdown(null);
      }
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying]);

  const seekRelative = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    showToast(seconds > 0 ? `+${seconds} 秒` : `${seconds} 秒`);
  }, [duration, showToast]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
      showToast(`音量: ${Math.round((volume || 0.5) * 100)}%`);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
      showToast('已静音');
    }
  }, [isMuted, volume, showToast]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      showToast('画中画模式不可用');
    }
  }, [showToast]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    showToast(`播放速度: ${speed}x`);
  };

  // Keyboard Shortcuts implementation (Space, Arrows, F, M, P, T, [, ])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'arrowup':
          e.preventDefault();
          if (videoRef.current) {
            const nextVol = Math.min(1, (videoRef.current.volume || 0) + 0.1);
            videoRef.current.volume = nextVol;
            setVolume(nextVol);
            setIsMuted(false);
            showToast(`音量: ${Math.round(nextVol * 100)}%`);
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (videoRef.current) {
            const nextVol = Math.max(0, (videoRef.current.volume || 0) - 0.1);
            videoRef.current.volume = nextVol;
            setVolume(nextVol);
            setIsMuted(nextVol === 0);
            showToast(`音量: ${Math.round(nextVol * 100)}%`);
          }
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          setIsTheaterMode((prev) => !prev);
          showToast(isTheaterMode ? '退出影院模式' : '进入宽屏影院模式');
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case '[':
          e.preventDefault();
          if (onPrevEpisode) onPrevEpisode();
          break;
        case ']':
          e.preventDefault();
          if (onNextEpisode) onNextEpisode();
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, toggleMute, toggleFullscreen, togglePiP, isTheaterMode, onNextEpisode, onPrevEpisode, showToast]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettingsDrawer && !showShortcutsHelp) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Mobile double tap
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const touch = e.changedTouches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const isLeft = touchX < rect.width / 2;

    if (now - lastTapRef.current.time < 300) {
      seekRelative(isLeft ? -10 : 10);
    } else {
      setShowControls((prev) => !prev);
    }
    lastTapRef.current = { time: now, x: touchX };
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const totalSecs = Math.floor(secs);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Compute smart video enhancement filter
  const getFilterStyle = () => {
    let f = `brightness(${brightness}%)`;
    if (colorPreset === 'hdr') {
      f += ' contrast(108%) saturate(118%)';
    } else if (colorPreset === 'cinema') {
      f += ' contrast(112%) saturate(106%) sepia(8%)';
    } else if (colorPreset === 'night') {
      f += ' contrast(94%) brightness(88%) sepia(16%)';
    }
    return f;
  };

  // Subtitle styling class computation
  const subtitleClasses = `inline-block px-3 py-1 rounded tracking-wide font-medium backdrop-blur-xs transition-all ${
    subtitleSize === 'sm' ? 'text-xs' : subtitleSize === 'lg' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
  } ${
    subtitleColor === 'yellow' ? 'text-yellow-300 bg-black/80' : subtitleColor === 'cyan' ? 'text-cyan-300 bg-black/80' : 'text-white bg-black/80'
  }`;

  return (
    <div className="relative w-full">
      {/* Smart Cinema Atmospheric Ambilight Glow */}
      {isAmbilightOn && isPlaying && (
        <div 
          className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-[#E50914]/25 via-blue-500/15 to-[#E50914]/25 rounded-2xl blur-2xl opacity-60 pointer-events-none transition-opacity duration-700 -z-10" 
        />
      )}

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full aspect-video bg-[#000000] rounded-xl overflow-hidden shadow-2xl select-none group border border-white/10 transition-all ${
          isTheaterMode ? 'max-w-none shadow-black' : ''
        }`}
      >
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          playsInline
          style={{ filter: getFilterStyle() }}
          className="w-full h-full object-contain cursor-pointer transition-all duration-300"
          onClick={togglePlay}
        />

        {/* Dynamic Subtitle overlay simulation */}
        {selectedSubtitle !== '关闭' && isPlaying && (
          <div className="absolute bottom-14 sm:bottom-16 left-0 right-0 text-center pointer-events-none px-4 z-20">
            <span className={subtitleClasses}>
              [RUDAFLIX 杜比全景声] 极清原画无广告播放中
            </span>
          </div>
        )}

        {/* Floating Status Toast */}
        {toastMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-black/90 text-white px-3.5 py-1 rounded-full text-[11px] font-medium border border-white/10 shadow-xl backdrop-blur-md animate-fadeIn">
            {toastMessage}
          </div>
        )}

        {/* Smart Skip Intro Button (+90s in first 2 mins) */}
        {currentTime > 5 && currentTime < 120 && duration > 240 && (
          <div className="absolute bottom-16 left-4 sm:left-6 z-30 animate-fadeIn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                seekRelative(90);
                showToast('已智能跳过片头 +90 秒');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/80 hover:bg-[#E50914] text-white border border-white/20 hover:border-[#E50914] text-[10px] sm:text-[11px] font-semibold backdrop-blur-md transition shadow-xl cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-[#E50914] group-hover:text-white" />
              <span>智能跳过片头</span>
              <span className="text-[9px] text-[#A1A1AA]">+90s</span>
            </button>
          </div>
        )}

        {/* Next Episode Countdown Overlay */}
        {nextCountdown !== null && onNextEpisode && (
          <div className="absolute bottom-16 right-5 z-40 bg-[#111318]/95 border border-[#E50914] text-white p-3 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-fadeIn">
            <div>
              <p className="text-[10px] text-[#A1A1AA]">即将播放下一集</p>
              <p className="text-xs font-bold text-white mt-0.5">倒计时 {nextCountdown} 秒</p>
            </div>
            <button
              onClick={() => {
                setNextCountdown(null);
                onNextEpisode();
              }}
              className="px-2.5 py-1 rounded bg-[#E50914] hover:bg-[#B80710] text-[11px] font-bold text-white transition cursor-pointer"
            >
              立即播放
            </button>
            <button
              onClick={() => setNextCountdown(null)}
              className="p-1 text-white/50 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      {/* TOP HEADER OVERLAY */}
      <div 
        className={`absolute top-0 left-0 right-0 p-3.5 sm:p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between text-white">
          {/* Left: Back Arrow + Title + Episode */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="返回"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {movieTitle}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#A1A1AA] mt-0.5">
                <span className="text-[#E50914] font-medium">{episodeName}</span>
                <span>·</span>
                <span 
                  onClick={() => setShowSettingsDrawer(true)}
                  className="hover:text-white cursor-pointer"
                >
                  蓝光 {selectedQuality}
                </span>
                <span>·</span>
                <span className="text-white/40">{sourceName}</span>
              </div>
            </div>
          </div>

          {/* Right: Cast, Shortcuts help, Theater mode, Settings, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-white">
            <button
              onClick={() => setShowShortcutsHelp((prev) => !prev)}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer hidden sm:inline-block"
              title="快捷键说明 (?)"
            >
              <Keyboard className="w-4 h-4 text-white/80" />
            </button>
            <button
              onClick={() => showToast('投屏已连接，正在投射至同局域网大屏设备')}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="无线投屏"
            >
              <Tv className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => {
                setIsTheaterMode(!isTheaterMode);
                showToast(isTheaterMode ? '已恢复标准视窗' : '已进入宽屏影院模式');
              }}
              className={`p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer hidden sm:inline-block ${
                isTheaterMode ? 'text-[#E50914]' : 'text-white'
              }`}
              title="宽屏影院模式 (T)"
            >
              <Tv2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettingsDrawer((prev) => !prev)}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="播放设置"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="全屏 (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* CENTER CONTROLS (Backward 10s, Big Play/Pause, Forward 10s) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center gap-8 sm:gap-14 pointer-events-none transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Backward 10s */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            seekRelative(-10);
          }}
          className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition active:scale-90 cursor-pointer flex flex-col items-center justify-center"
          title="快退 10 秒 (J / ←)"
        >
          <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-[9px] font-bold mt-0.5 font-mono">10</span>
        </button>

        {/* Center Big Play/Pause */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/25 hover:bg-white/35 text-white backdrop-blur-md flex items-center justify-center transition active:scale-95 shadow-xl cursor-pointer"
          title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          ) : (
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Forward 10s */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            seekRelative(10);
          }}
          className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition active:scale-90 cursor-pointer flex flex-col items-center justify-center"
          title="快进 10 秒 (L / →)"
        >
          <RotateCw className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-[9px] font-bold mt-0.5 font-mono">10</span>
        </button>
      </div>

      {/* BOTTOM SCRUBBER & CONTROL BAR */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Progress bar */}
        <div className="relative w-full mb-2.5 flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/25 rounded-lg appearance-none cursor-pointer accent-[#E50914] hover:h-1.5 transition-all"
            style={{
              background: `linear-gradient(to right, #E50914 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
            }}
          />
        </div>

        {/* Action icons row (Refined compact typography) */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Small Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1 rounded-full hover:bg-white/20 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Time display */}
            <div className="text-[10px] sm:text-[11px] font-mono text-[#A1A1AA]">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/30">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <button onClick={toggleMute} className="p-1 hover:bg-white/20 rounded cursor-pointer">
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-[#A1A1AA]" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
              />
            </div>
          </div>

          {/* Right tool buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Subtitles toggle */}
            <button
              onClick={() => {
                const nextSub = selectedSubtitle === '中文' ? '关闭' : '中文';
                setSelectedSubtitle(nextSub);
                showToast(`字幕: ${nextSub}`);
              }}
              className={`p-1 rounded hover:bg-white/20 transition cursor-pointer ${
                selectedSubtitle !== '关闭' ? 'text-[#E50914]' : 'text-white/70'
              }`}
              title="字幕开关"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Episodes Drawer toggle */}
            {onOpenEpisodesDrawer && (
              <button
                onClick={onOpenEpisodesDrawer}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white transition cursor-pointer"
                title="打开选集"
              >
                选集
              </button>
            )}

            {/* Speed selector */}
            <div className="relative group/speed">
              <button className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] sm:text-[11px] font-mono text-white transition cursor-pointer">
                {playbackRate}x
              </button>
              <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/speed:flex flex-col bg-[#111318] border border-white/10 rounded-lg p-1 shadow-xl text-[11px] z-50">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-2.5 py-1 rounded text-left hover:bg-white/10 transition cursor-pointer ${
                      playbackRate === rate ? 'text-[#E50914] font-bold' : 'text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-1 rounded hover:bg-white/20 transition cursor-pointer hidden sm:inline-block"
              title="画中画 (P)"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsDrawer((prev) => !prev)}
              className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
              title="全屏 (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs text-white z-40">
          <div className="w-10 h-10 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin mb-2.5"></div>
          <p className="text-xs font-semibold tracking-wide">正在加载极清流媒体...</p>
        </div>
      )}

      {/* Error state overlay */}
      {errorMsg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-white z-40 p-5 text-center">
          <AlertCircle className="w-9 h-9 text-[#E50914] mb-2.5" />
          <h4 className="text-sm font-bold text-white mb-1">播放遇到异常</h4>
          <p className="text-[11px] text-[#A1A1AA] max-w-md mb-3">{errorMsg}</p>
          <div className="flex items-center gap-2.5">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#181818] hover:bg-white/10 text-xs font-medium transition cursor-pointer border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重试播放
              </button>
            )}
            {fallbackAvailable && onSwitchFallback && (
              <button
                onClick={onSwitchFallback}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E50914] hover:bg-[#B80710] text-xs font-bold text-white shadow-lg transition cursor-pointer"
              >
                <Tv2 className="w-3.5 h-3.5" />
                切换备用线路
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutsHelp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#111318] border border-white/10 rounded-xl p-4 max-w-sm w-full space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Keyboard className="w-4 h-4 text-[#E50914]" />
                播放器键盘快捷键
              </span>
              <button onClick={() => setShowShortcutsHelp(false)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] text-[#A1A1AA]">
              <div className="flex justify-between"><span>播放 / 暂停</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">空格 / K</kbd></div>
              <div className="flex justify-between"><span>快退 10 秒</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">← / J</kbd></div>
              <div className="flex justify-between"><span>快进 10 秒</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">→ / L</kbd></div>
              <div className="flex justify-between"><span>音量增 / 减</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">↑ / ↓</kbd></div>
              <div className="flex justify-between"><span>静音切换</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">M</kbd></div>
              <div className="flex justify-between"><span>全屏切换</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">F</kbd></div>
              <div className="flex justify-between"><span>宽屏影院模式</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">T</kbd></div>
              <div className="flex justify-between"><span>画中画模式</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">P</kbd></div>
              <div className="flex justify-between"><span>上一集 / 下一集</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">[ / ]</kbd></div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM PLAYBACK SETTINGS DRAWER (Upgraded with Subtitle Style & Brightness) */}
      {showSettingsDrawer && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#111318]/95 backdrop-blur-xl border-t border-white/10 p-4 sm:p-5 rounded-t-xl space-y-3.5 animate-slideUp">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[#E50914]" />
              播放设置
            </h3>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="p-1 text-white/50 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            {/* 1. 清晰度 */}
            <div className="p-2 rounded-lg bg-[#181818] border border-white/5 space-y-1">
              <div className="w-7 h-7 mx-auto rounded bg-white/10 flex items-center justify-center text-white">
                <Gauge className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-[#A1A1AA]">清晰度</p>
              <select
                value={selectedQuality}
                onChange={(e) => {
                  setSelectedQuality(e.target.value);
                  showToast(`清晰度已切换为 ${e.target.value}`);
                }}
                className="w-full bg-transparent text-[11px] font-bold text-white text-center focus:outline-none cursor-pointer"
              >
                <option value="4K杜比" className="bg-[#111318]">4K杜比</option>
                <option value="1080P" className="bg-[#111318]">1080P</option>
                <option value="720P" className="bg-[#111318]">720P</option>
              </select>
            </div>

            {/* 2. 字幕 */}
            <div className="p-2 rounded-lg bg-[#181818] border border-white/5 space-y-1">
              <div className="w-7 h-7 mx-auto rounded bg-white/10 flex items-center justify-center text-white">
                <Subtitles className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-[#A1A1AA]">字幕</p>
              <select
                value={selectedSubtitle}
                onChange={(e) => {
                  setSelectedSubtitle(e.target.value);
                  showToast(`字幕已切换为 ${e.target.value}`);
                }}
                className="w-full bg-transparent text-[11px] font-bold text-white text-center focus:outline-none cursor-pointer"
              >
                <option value="中文" className="bg-[#111318]">中文</option>
                <option value="英文" className="bg-[#111318]">英文</option>
                <option value="关闭" className="bg-[#111318]">关闭</option>
              </select>
            </div>

            {/* 3. 音轨 */}
            <div className="p-2 rounded-lg bg-[#181818] border border-white/5 space-y-1">
              <div className="w-7 h-7 mx-auto rounded bg-white/10 flex items-center justify-center text-white">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-[#A1A1AA]">音轨</p>
              <select
                value={selectedAudioTrack}
                onChange={(e) => {
                  setSelectedAudioTrack(e.target.value);
                  showToast(`音轨已切换为 ${e.target.value}`);
                }}
                className="w-full bg-transparent text-[11px] font-bold text-white text-center focus:outline-none cursor-pointer"
              >
                <option value="国语" className="bg-[#111318]">国语</option>
                <option value="英语原声" className="bg-[#111318]">原声</option>
              </select>
            </div>

            {/* 4. 倍速 */}
            <div className="p-2 rounded-lg bg-[#181818] border border-white/5 space-y-1">
              <div className="w-7 h-7 mx-auto rounded bg-white/10 flex items-center justify-center text-white">
                <FastForward className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-[#A1A1AA]">倍速</p>
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full bg-transparent text-[11px] font-bold text-white text-center focus:outline-none cursor-pointer"
              >
                <option value={0.75} className="bg-[#111318]">0.75x</option>
                <option value={1.0} className="bg-[#111318]">1.0x</option>
                <option value={1.25} className="bg-[#111318]">1.25x</option>
                <option value={1.5} className="bg-[#111318]">1.5x</option>
                <option value={2.0} className="bg-[#111318]">2.0x</option>
              </select>
            </div>
          </div>

          {/* Subtitle custom styles bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-[#A1A1AA]">
            <div className="flex items-center gap-1.5">
              <span>字号:</span>
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubtitleSize(s)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    subtitleSize === s ? 'bg-[#E50914] text-white font-bold' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span>颜色:</span>
              {(['white', 'yellow', 'cyan'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSubtitleColor(c)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    subtitleColor === c ? 'bg-[#E50914] text-white font-bold' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {c === 'white' ? '白' : c === 'yellow' ? '黄' : '蓝'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <Sun className="w-3 h-3 text-[#A1A1AA]" />
              <span>亮度:</span>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-16 h-1 accent-[#E50914] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
