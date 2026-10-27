'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Globe, Sparkles, Check, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  initialGeminiKey = '',
  initialTavilyKey = '',
  initialModel = 'gemini-2.5-flash',
}) {
  const [geminiKey, setGeminiKey] = useState(initialGeminiKey);
  const [tavilyKey, setTavilyKey] = useState(initialTavilyKey);
  const [model, setModel] = useState(initialModel);
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    setGeminiKey(initialGeminiKey);
    setTavilyKey(initialTavilyKey);
    setModel(initialModel);
  }, [initialGeminiKey, initialTavilyKey, initialModel]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(geminiKey.trim(), tavilyKey.trim(), model);
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-6 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cấu Hình API Keys & Mô Hình</h2>
              <p className="text-xs text-slate-400">Thiết lập kết nối Google Gemini và Tavily Search API</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                Lấy khóa miễn phí <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-slate-100 placeholder:text-slate-600 font-mono transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dùng để phân rã câu hỏi, đánh giá tính đầy đủ (Self-Reflection) và tạo báo cáo đối chiếu.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Mô hình Google Gemini
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 outline-none text-slate-100 transition"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng - Cực nhanh & thông minh)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ cao, tối ưu chi phí)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Suy luận sâu, ngữ cảnh lớn)</option>
            </select>
          </div>

          {/* Tavily API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Tavily Search API Key
              </label>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                Đăng ký 1,000 req/tháng miễn phí <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="tvly-..."
              value={tavilyKey}
              onChange={(e) => setTavilyKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-100 placeholder:text-slate-600 font-mono transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dùng cho AI Agent tự động tìm kiếm Google khi tài liệu nội bộ không đủ thông tin hoặc cần số liệu thị trường mới nhất.
            </p>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              API Keys được lưu trữ an toàn trong trình duyệt của bạn (LocalStorage) và chỉ truyền trực tiếp khi thực thi tác vụ. Không lưu trên máy chủ công cộng.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition"
            >
              {isSavedToast ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Đã Lưu!
                </>
              ) : (
                'Lưu Cấu Hình'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
