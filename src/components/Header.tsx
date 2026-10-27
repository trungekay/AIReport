'use client';

import React from 'react';
import { Cpu, Sparkles, Key, FileSpreadsheet, FileText, Database } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onLoadSampleData: () => void;
  isLoadingSample: boolean;
  hasApiKeys: boolean;
  docCount: number;
}

export default function Header({
  onOpenSettings,
  onLoadSampleData,
  isLoadingSample,
  hasApiKeys,
  docCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Topic Tag */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                AutoIntellect AI
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shadow-sm">
                <Sparkles className="w-3 h-3" /> Autonomous Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Topic: <span className="text-slate-300 font-semibold">Building Autonomous & Intelligent AI Systems</span> | Multi-Doc RAG + Tavily Web Search
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* Quick Demo Data Loader */}
          <button
            type="button"
            onClick={onLoadSampleData}
            disabled={isLoadingSample}
            title="Tải bộ dữ liệu mẫu gồm 1 tệp PDF tài chính, 1 tệp Excel doanh thu và 1 tệp Word chiến lược"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isLoadingSample ? 'Đang nạp mẫu...' : 'Nạp Dữ Liệu Mẫu (PDF + Excel + Word)'}</span>
            <div className="flex items-center -space-x-1 ml-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500" title="PDF"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Excel"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500" title="Word"></span>
            </div>
          </button>

          {/* API Keys Configuration */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-sm ${
              hasApiKeys
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                : 'bg-indigo-950/50 text-indigo-200 border-indigo-700/60 hover:bg-indigo-900/60 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>{hasApiKeys ? 'API Keys: Đã kết nối' : 'Cấu hình API Keys (Gemini & Tavily)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
