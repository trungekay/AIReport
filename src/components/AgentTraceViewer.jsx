'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Search,
  Layers,
  Globe,
  ChevronDown,
  ChevronUp,
  Brain,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export default function AgentTraceViewer({
  steps = [],
  evaluation,
  isExecuting,
}) {
  const [expandedStepId, setExpandedStepId] = useState(null);

  if (steps.length === 0 && !isExecuting) {
    return null;
  }

  const toggleExpand = (id) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const getStepIcon = (title, status) => {
    if (status === 'running') {
      return (
        <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0"></div>
      );
    }
    if (status === 'skipped') {
      return <Clock className="w-5 h-5 text-slate-500 shrink-0" />;
    }
    if (title.includes('Vector') || title.includes('RAG')) {
      return <Layers className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
    if (title.includes('Tavily') || title.includes('Web')) {
      return <Globe className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
    if (title.includes('Đầy đủ') || title.includes('Lỗ hổng')) {
      return <Brain className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Tiến Trình Suy Luận Tự Hành Của AI Agent (Autonomous Reasoning Trace)
              {isExecuting && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse">
                  Đang xử lý
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Quan sát trực quan các bước: Đánh chỉ mục RAG ➔ Tự đánh giá lỗ hổng ➔ Kích hoạt Tavily Search ➔ Đối chiếu đa tài liệu
            </p>
          </div>
        </div>

        {/* Confidence Gauge if evaluation exists */}
        {evaluation && (
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Độ Đầy Đủ Nội Bộ (RAG)</p>
              <p
                className={`text-sm font-bold font-mono ${
                  evaluation.confidenceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {evaluation.confidenceScore}% {evaluation.isSufficient ? '✓ Đủ' : '⚡ Cần Web Search'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center relative">
              <span
                className={`text-xs font-bold font-mono ${
                  evaluation.confidenceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {evaluation.confidenceScore}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isExpanded = expandedStepId === step.id;
          return (
            <div
              key={step.id}
              className={`rounded-xl border transition-all duration-200 ${
                step.status === 'running'
                  ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-500/5'
                  : step.status === 'skipped'
                  ? 'border-slate-800/60 bg-slate-950/40 opacity-70'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
              }`}
            >
              {/* Step Title Row */}
              <button
                type="button"
                onClick={() => toggleExpand(step.id)}
                className="w-full flex items-center justify-between p-3.5 text-left"
              >
                <div className="flex items-center gap-3">
                  {getStepIcon(step.title, step.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{step.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">[{step.timestamp}]</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {step.status === 'completed' && (
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      Hoàn thành
                    </span>
                  )}
                  {step.status === 'skipped' && (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Bỏ qua
                    </span>
                  )}
                  {step.details && (
                    <div className="text-slate-400 hover:text-white transition">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              </button>

              {/* Step Expanded Details */}
              {isExpanded && step.details && (
                <div className="px-4 pb-3.5 pt-1 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                  {step.details.summaryNote && (
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2 text-slate-300">
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{step.details.summaryNote}</span>
                    </div>
                  )}

                  {/* Search Queries Details */}
                  {step.details.searchQueries && step.details.searchQueries.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 mb-1">
                        Các câu hỏi/truy vấn đã thực thi:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {step.details.searchQueries.map((q, qIdx) => (
                          <span
                            key={qIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-cyan-300"
                          >
                            <Search className="w-3 h-3 text-cyan-400" /> &quot;{q}&quot;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gaps Identified */}
                  {step.details.gapsIdentified && step.details.gapsIdentified.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Lỗ hổng thông tin phát hiện trong tài liệu:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                        {step.details.gapsIdentified.map((gap, gIdx) => (
                          <li key={gIdx} className="text-[11px]">{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
