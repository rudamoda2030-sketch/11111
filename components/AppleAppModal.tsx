'use client';

import React, { useState } from 'react';
import { Smartphone, Copy, Check, X, Shield, Zap } from 'lucide-react';

interface AppleAppModalProps {
  onClose: () => void;
}

export default function AppleAppModal({ onClose }: AppleAppModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyUrl = (path: string, key: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}${path}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#111914] border border-[#183B2B] rounded-3xl shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#183B2B]/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#183B2B] text-[#C6A66A] border border-[#397454]/40">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#F2F3EF]">移动客户端与电视盒子配置</h3>
              <p className="text-xs text-[#F2F3EF]/50">原生适配苹果影视 App · 零配置即连即播</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#F2F3EF]/50 hover:text-[#F2F3EF] rounded-xl hover:bg-[#183B2B] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Native MacCMS VOD */}
        <div className="p-4 bg-[#090C0A] rounded-2xl border border-[#183B2B]/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F2F3EF] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#C6A66A]" />
              标准方式：影视 App 自定义数据源
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#183B2B] text-[#C6A66A] font-bold">
              推荐
            </span>
          </div>
          <p className="text-xs text-[#F2F3EF]/60">
            在您的苹果影视 App（iOS/iPad/Apple TV）中添加自定义数据源时，直接粘贴此链接：
          </p>
          <div className="flex items-center gap-2 bg-[#111914] p-2.5 rounded-xl border border-[#183B2B] font-mono text-xs text-[#397454]">
            <span className="flex-1 truncate">/api/provide/vod</span>
            <button
              onClick={() => copyUrl('/api/provide/vod', 'vod')}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#397454] hover:bg-[#397454]/90 text-[#F2F3EF] rounded-lg text-xs font-semibold cursor-pointer transition shadow"
            >
              {copiedKey === 'vod' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'vod' ? '已复制' : '复制'}</span>
            </button>
          </div>
        </div>

        {/* Option 2: Independent JSON Resolve API */}
        <div className="p-4 bg-[#090C0A] rounded-2xl border border-[#183B2B]/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F2F3EF] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#397454]" />
              高级方式：独立 JSON 解析接口
            </span>
          </div>
          <p className="text-xs text-[#F2F3EF]/60">
            如果 App 支持自定义解析（JSON Parser），填入独立解析接口地址：
          </p>
          <div className="flex items-center gap-2 bg-[#111914] p-2.5 rounded-xl border border-[#183B2B] font-mono text-xs text-[#C6A66A]">
            <span className="flex-1 truncate">/api/v1/play/resolve</span>
            <button
              onClick={() => copyUrl('/api/v1/play/resolve', 'resolve')}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#183B2B] hover:bg-[#397454] text-[#F2F3EF] rounded-lg text-xs font-semibold cursor-pointer transition"
            >
              {copiedKey === 'resolve' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'resolve' ? '已复制' : '复制'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#183B2B] hover:bg-[#397454] text-[#F2F3EF] text-xs font-semibold cursor-pointer transition"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
}
