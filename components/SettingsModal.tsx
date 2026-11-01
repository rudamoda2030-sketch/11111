'use client';

import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Lock, 
  CheckCheck, 
  Code2, 
  Sliders
} from 'lucide-react';
import CmsTester from './CmsTester';
import ApiDocConsole from './ApiDocConsole';
import AdminSecurityPanel from './AdminSecurityPanel';
import AcceptanceTestModal from './AcceptanceTestModal';

interface SettingsModalProps {
  onClose: () => void;
}

type AdminTab = 'security' | 'cms_connect' | 'tests' | 'api_doc';

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('security');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#111914] border border-[#183B2B] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#183B2B]/60 bg-[#090C0A]/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#183B2B] text-[#C6A66A] border border-[#397454]/40">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#F2F3EF]">解析后台与高级管理</h3>
              <p className="text-xs text-[#F2F3EF]/60">MacCMS 连通设置 · 域名白名单 · 安全审计 · 自动化测试</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#F2F3EF]/60 hover:text-[#F2F3EF] rounded-xl hover:bg-[#183B2B] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#090C0A] border-b border-[#183B2B]/60 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#397454] text-[#F2F3EF] shadow'
                : 'text-[#F2F3EF]/60 hover:text-[#F2F3EF] hover:bg-[#111914]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>安全白名单与监控</span>
          </button>

          <button
            onClick={() => setActiveTab('cms_connect')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'cms_connect'
                ? 'bg-[#397454] text-[#F2F3EF] shadow'
                : 'text-[#F2F3EF]/60 hover:text-[#F2F3EF] hover:bg-[#111914]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>MacCMS 连通与联调</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-[#397454] text-[#F2F3EF] shadow'
                : 'text-[#F2F3EF]/60 hover:text-[#F2F3EF] hover:bg-[#111914]'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>自动化测试套件</span>
          </button>

          <button
            onClick={() => setActiveTab('api_doc')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'api_doc'
                ? 'bg-[#397454] text-[#F2F3EF] shadow'
                : 'text-[#F2F3EF]/60 hover:text-[#F2F3EF] hover:bg-[#111914]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>开发者 API 文档</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'security' && <AdminSecurityPanel />}
          {activeTab === 'cms_connect' && <CmsTester />}
          {activeTab === 'tests' && <AcceptanceTestModal />}
          {activeTab === 'api_doc' && <ApiDocConsole />}
        </div>

      </div>
    </div>
  );
}
