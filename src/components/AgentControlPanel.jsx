'use client';

import React from 'react';
import {
  Sparkles,
  Bot,
  Globe,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export default function AgentControlPanel({
  userPrompt,
  setUserPrompt,
  enableWebSearch,
  setEnableWebSearch,
  onExecuteAgent,
  isExecuting,
  hasDocuments,
  hasApiKeys,
}) {
  const quickPrompts = [
    {
      label: 'So sánh tài chính Q1 vs Q2 & Benchmark',
      prompt:
        'So sánh kết quả tài chính giữa báo cáo PDF Q1 và bảng tính Excel Q2, chỉ ra sự biến động doanh thu, cơ cấu chi phí, lợi nhuận và benchmark đối chiếu với mặt bằng chung toàn ngành năm 2024-2025.',
      icon: TrendingUp,
      color: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/30',
    },
    {
      label: 'Kiểm toán tiến độ chiến lược & Rủi ro',
      prompt:
        'Đối chiếu các chỉ tiêu trong tệp Word mục tiêu chiến lược với số liệu thực tế tại PDF và Excel; đánh giá tỷ lệ hoàn thành kế hoạch và nhận diện rủi ro vận hành.',
      icon: AlertTriangle,
      color: 'text-amber-400 border-amber-800/60 bg-amber-950/30',
    },
    {
      label: 'Báo cáo tổng hợp điều hành toàn diện',
      prompt:
        'Tạo bản báo cáo điều hành toàn diện cho Ban Giám Đốc tổng hợp từ tất cả các tệp tài liệu, kèm ma trận so sánh chi tiết và kiến nghị chiến lược cho 6 tháng cuối năm.',
      icon: FileCheck2,
      color: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/30',
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          2. Yêu Cầu Phân Tích & Điều Khiển Tác Tử (AI Agent)
        </h2>
        <p className="text-xs text-slate-400">
          Agent sẽ tự động phân rã yêu cầu, truy vấn RAG và kích hoạt Google Search qua Tavily nếu thiếu dữ liệu
        </p>
      </div>

      {/* Preset Chips */}
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-300">
          <Flame className="w-3.5 h-3.5 text-orange-400" /> Gợi ý kịch bản phân tích mẫu:
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setUserPrompt(item.prompt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${item.color} hover:brightness-125`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Textarea for Custom Prompt */}
      <div className="flex-1 flex flex-col">
        <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>Nội dung yêu cầu hoặc câu hỏi cụ thể:</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {(userPrompt || '').length} ký tự
          </span>
        </label>
        <textarea
          rows={5}
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Ví dụ: So sánh đối chiếu doanh thu và chi phí giữa các quý, đánh giá xem có đạt mục tiêu chiến lược không. Nếu thiếu số liệu benchmark ngành thì tự động tìm kiếm trên mạng để bổ sung..."
          className="w-full flex-1 px-4 py-3 text-sm rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-slate-100 placeholder:text-slate-500 transition resize-none leading-relaxed"
        />
      </div>

      {/* Autonomous Search Toggle & Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Tự Động Kích Hoạt Tavily Search (Google)
              </p>
              <p className="text-[11px] text-slate-400">
                Nếu RAG không đủ dữ liệu hoặc cần số liệu thị trường, Agent sẽ tự động tìm kiếm bên ngoài
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableWebSearch}
              onChange={(e) => setEnableWebSearch(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {!hasApiKeys && (
          <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            Đang chạy chế độ mô phỏng AI Agent thông minh. Nhập API Keys để kết nối trực tiếp Gemini & Tavily live.
          </p>
        )}
      </div>

      {/* Launch CTA Button */}
      <button
        type="button"
        disabled={isExecuting || !hasDocuments || !(userPrompt || '').trim()}
        onClick={onExecuteAgent}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all duration-300 ${
          isExecuting
            ? 'bg-slate-800 text-cyan-400 cursor-not-allowed border border-cyan-500/30'
            : !hasDocuments || !(userPrompt || '').trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isExecuting ? (
          <>
            <Bot className="w-5 h-5 animate-spin" />
            <span>AI Agent Đang Suy Luận & Tổng Hợp...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-cyan-200" />
            <span>Kích Hoạt Autonomous AI Agent</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
