'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Copy,
  Download,
  Printer,
  Check,
  Globe,
  Database,
  MessageSquare,
  Send,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function ReportViewer({ report, apiKey }) {
  const [activeTab, setActiveTab] = useState('report');
  const [copied, setCopied] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      text: 'Xin chào! Bản báo cáo đã được AI Agent tổng hợp hoàn chỉnh từ các tài liệu PDF, Excel, Word và tìm kiếm trực tuyến Tavily. Bạn có thắc mắc hoặc cần làm rõ số liệu nào trong báo cáo không?',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  if (!report) return null;

  const ragSourcesUsed = report.ragSourcesUsed || [];
  const webSourcesUsed = report.webSourcesUsed || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(report.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report.markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_AI_Agent_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim() || isAsking) return;

    const userText = chatQuestion.trim();
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setChatQuestion('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          reportContext: report.markdownContent,
          apiKey,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.error || 'Đã có lỗi khi trả lời câu hỏi.';
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: replyText,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Không thể kết nối đến máy chủ trợ lý.',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
      {/* Top Bar with Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950/80 border-b border-slate-800 no-print">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'report'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Bản Báo Cáo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sources'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Nguồn Thẩm Định ({ragSourcesUsed.length + webSourcesUsed.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Hỏi Đáp Tiếp Nối
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tải về (.md)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 overflow-y-auto max-h-[750px]">
        {/* TAB 1: Markdown Report */}
        {activeTab === 'report' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Report Metadata Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Báo cáo hoàn chỉnh tạo bởi: <strong className="text-slate-200">Autonomous AI System</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>RAG nội bộ: <strong className="text-cyan-400">{ragSourcesUsed.length} đoạn trích</strong></span>
                <span>Web Tavily: <strong className="text-indigo-400">{webSourcesUsed.length} nguồn liên kết</strong></span>
                <span>Ngày tạo: {new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* Markdown Body */}
            <article className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.markdownContent}
              </ReactMarkdown>
            </article>
          </div>
        )}

        {/* TAB 2: Source Attribution & Citations */}
        {activeTab === 'sources' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Kiểm Toán & Dẫn Chứng Nguồn Dữ Liệu (Attribution Audit)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Minh bạch nguồn thông tin: Phân định rõ ràng giữa dữ liệu trích xuất từ tài liệu người dùng tải lên và thông tin tìm kiếm trực tuyến qua Tavily API.
              </p>
            </div>

            {/* RAG Sources Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Nguồn Tài Liệu Nội Bộ (RAG Chunks - {ragSourcesUsed.length})
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {ragSourcesUsed.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                      <span className="font-semibold text-slate-200">
                        [{src.docType.toUpperCase()}] {src.docName}
                      </span>
                      <span className="text-cyan-400 font-mono">
                        {src.pageOrSheet} • Khớp {Math.round(src.score * 100)}%
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {src.chunkContent}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tavily Web Sources Section */}
            {webSourcesUsed.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Nguồn Nghiên Cứu Trực Tuyến (Tavily AI Web Search - {webSourcesUsed.length})
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {webSourcesUsed.map((web, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-indigo-950/60 hover:border-indigo-800/60 transition space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={web.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-indigo-300 hover:underline flex items-center gap-1.5"
                        >
                          {web.title} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                        {web.score && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Score: {(web.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-3">
                        {web.content}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        {web.url}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Conversational Q&A */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto flex flex-col h-[520px]">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              {isAsking && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Trợ lý đang tra cứu số liệu báo cáo...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Đặt câu hỏi về các chỉ số trong báo cáo, giải thích bảng so sánh..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!chatQuestion.trim() || isAsking}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
